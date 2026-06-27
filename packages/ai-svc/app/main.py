from __future__ import annotations

import json
import os
import re
import time
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from app.assistant import get_ai_response
from app.db import get_connection, init_ai_tables


class ChatRequest(BaseModel):
    user_input: str = Field(..., min_length=1, max_length=2000)
    chat_history: list[dict[str, Any]] = Field(default_factory=list)


class LegacyChatRequest(BaseModel):
    conversationId: int | None = None
    message: str | None = Field(default=None, min_length=1, max_length=2000)
    user_input: str | None = Field(default=None, min_length=1, max_length=2000)
    chat_history: list[dict[str, Any]] = Field(default_factory=list)


class FeedbackRequest(BaseModel):
    chat_log_id: int = Field(..., ge=1)
    user_id: int | None = None
    rating: str = Field(..., min_length=1, max_length=20)
    comment: str | None = None


class InspirationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    prompt: str = Field(..., min_length=1)
    sort_order: int = 0
    status: str = Field(default="active", max_length=20)


class PersonaRequest(BaseModel):
    name: str = Field(default="洛灵儿", min_length=1, max_length=100)
    welcome_message: str | None = None
    system_prompt: str | None = None
    model: str | None = Field(default=None, max_length=100)
    temperature: float | None = Field(default=None, ge=0, le=2)
    status: str = Field(default="active", max_length=20)


class KnowledgeRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    source_type: str = Field(default="manual", max_length=30)
    embedding_status: str = Field(default="pending", max_length=20)
    status: str = Field(default="active", max_length=20)


class ItineraryPlanRequest(BaseModel):
    districts: list[str] = Field(default_factory=list)
    startDate: str | None = None
    endDate: str | None = None
    peopleCount: int = Field(default=2, ge=1, le=20)
    preferences: list[str] = Field(default_factory=list)
    budget: int | None = None
    days: int = Field(default=1, ge=1, le=14)


class TravelogueGenerateRequest(BaseModel):
    spots: list[str] = Field(default_factory=list)
    style: str = Field(default="口语化", max_length=50)
    experience: str = Field(default="", max_length=5000)


def convert_chat_history(chat_history: list[dict[str, Any]]) -> list[BaseMessage]:
    messages: list[BaseMessage] = []

    for item in chat_history:
        role = str(item.get("role", "")).lower()
        content = item.get("content")

        if not isinstance(content, str) or not content.strip():
            continue

        if role in {"user", "human"}:
            messages.append(HumanMessage(content=content))
        elif role in {"assistant", "ai"}:
            messages.append(AIMessage(content=content))
        elif role == "system":
            messages.append(SystemMessage(content=content))

    return messages[:20]


def ok(data: Any = None, message: str = "success") -> dict[str, Any]:
    return {"code": 0, "message": message, "data": data}


def paginated_query(table: str, page: int, page_size: int, where: str = "", params: tuple[Any, ...] = ()) -> dict[str, Any]:
    safe_page = max(1, page)
    safe_page_size = min(max(1, page_size), 100)
    offset = (safe_page - 1) * safe_page_size

    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) AS total FROM {table} {where}", params)
            total = cursor.fetchone()["total"]
            cursor.execute(
                f"SELECT * FROM {table} {where} ORDER BY id DESC LIMIT %s OFFSET %s",
                (*params, safe_page_size, offset),
            )
            rows = cursor.fetchall()

    return {"list": rows, "total": total, "page": safe_page, "pageSize": safe_page_size}


def detect_intent(text: str, actions: list[dict[str, Any]]) -> str:
    if actions:
        return "ticket_booking"
    if any(keyword in text for keyword in ["路线", "行程", "安排", "游"]):
        return "itinerary"
    if any(keyword in text for keyword in ["拍照", "打卡", "推荐"]):
        return "recommendation"
    return "chat"


ATTRACTION_SPOTS: dict[str, dict[str, Any]] = {
    "龙门石窟": {
        "projectId": 1,
        "ticketTypeId": 1,
        "ticketName": "龙门石窟成人票",
        "price": 90,
        "durationMinutes": 240,
        "reason": "世界文化遗产，石窟造像气势恢宏，是洛阳必打卡的人文景点。",
        "tips": "建议提前预约讲解，全程约 3-4 小时，穿舒适鞋子。",
    },
    "白马寺": {
        "projectId": 2,
        "ticketTypeId": 4,
        "ticketName": "白马寺成人票",
        "price": 35,
        "durationMinutes": 120,
        "reason": "中国第一官办寺院，佛教祖庭，历史文化底蕴深厚。",
        "tips": "寺内严禁喧哗，可预留 2 小时游览。",
    },
    "老君山": {
        "projectId": 3,
        "ticketTypeId": 7,
        "ticketName": "老君山门票+中灵索道往返",
        "price": 210,
        "durationMinutes": 420,
        "reason": "道教名山，金顶云海日出壮观，适合自然风光与户外体验。",
        "tips": "山上气温较低，建议携带外套；索道排队可能较长。",
    },
    "白云山": {
        "projectId": 4,
        "ticketTypeId": 10,
        "ticketName": "白云山门票+观光车",
        "price": 115,
        "durationMinutes": 480,
        "reason": "国家 5A 级景区，森林云海、奇峰飞瀑，适合深度游玩。",
        "tips": "建议一整天行程，关注天气与下山索道时间。",
    },
    "关林": {
        "projectId": 5,
        "ticketTypeId": 11,
        "ticketName": "关林成人票",
        "price": 40,
        "durationMinutes": 90,
        "reason": "三国文化圣地，关羽首级埋葬地，建筑规格宏大。",
        "tips": "与龙门石窟可安排在同一天顺路游览。",
    },
    "明堂天堂": {
        "projectId": 6,
        "ticketTypeId": 12,
        "ticketName": "明堂天堂成人票",
        "price": 120,
        "durationMinutes": 180,
        "reason": "隋唐洛阳城核心遗址，盛唐礼制建筑复原，夜游演出值得一看。",
        "tips": "推荐安排夜游场，配合应天门灯光秀效果更佳。",
    },
}

DEFAULT_ITINERARY_SPOTS = ["龙门石窟", "明堂天堂", "白马寺", "关林"]


def _build_itinerary_plan(payload: ItineraryPlanRequest) -> dict[str, Any]:
    days = max(1, min(payload.days, 14))
    people_count = max(1, payload.peopleCount or 1)
    districts = payload.districts or []
    preferences = payload.preferences or []

    day_plans: list[dict[str, Any]] = []
    spot_pool: list[str]

    if any("自然" in p or "户外" in p or "拍照" in p for p in preferences):
        spot_pool = ["老君山", "白云山", "龙门石窟", "明堂天堂"]
    elif any("非遗" in p or "人文" in p or "历史" in p or "文化" in p for p in preferences):
        spot_pool = ["龙门石窟", "白马寺", "关林", "明堂天堂"]
    else:
        spot_pool = DEFAULT_ITINERARY_SPOTS

    estimated_cost = 0
    all_recommended: list[dict[str, Any]] = []
    slot_labels = ["上午", "中午", "下午", "晚上"]
    start_hours = [9, 12, 14, 19]

    for day_index in range(days):
        day_items: list[dict[str, Any]] = []
        spots_for_day = spot_pool[day_index * 1 : day_index * 1 + 2] or spot_pool[:2]

        for slot_idx, spot_name in enumerate(spots_for_day):
            info = ATTRACTION_SPOTS.get(spot_name)
            if not info:
                continue
            start_hour = start_hours[slot_idx] if slot_idx < len(start_hours) else 10
            duration_h = info["durationMinutes"] // 60
            end_hour = min(22, start_hour + duration_h)
            day_items.append(
                {
                    "time": f"{start_hour:02d}:00-{end_hour:02d}:00",
                    "timeRange": f"{slot_labels[slot_idx] if slot_idx < len(slot_labels) else '时段'}游览 {spot_name}",
                    "projectId": info["projectId"],
                    "projectName": spot_name,
                    "spotName": spot_name,
                    "durationMinutes": info["durationMinutes"],
                    "ticketPrice": info["price"],
                    "reason": info["reason"],
                    "tips": info["tips"],
                }
            )
            estimated_cost += int(info["price"]) * people_count
            all_recommended.append(
                {
                    "ticketTypeId": info["ticketTypeId"],
                    "name": info["ticketName"],
                    "quantity": people_count,
                    "price": info["price"],
                    "total": int(info["price"]) * people_count,
                }
            )

        day_plans.append(
            {
                "day": day_index + 1,
                "title": f"第 {day_index + 1} 天 · 洛阳文化深度游",
                "items": day_items,
            }
        )

    summary = f"已为你规划 {days} 天洛阳行程，覆盖 {', '.join(spot_pool[:3])} 等核心景点，建议预算约 ¥{estimated_cost}。"
    if districts:
        summary += f" 主要涉及：{'、'.join(districts)}。"

    return {
        "summary": summary,
        "estimatedCost": estimated_cost,
        "days": day_plans,
        "recommendedTickets": all_recommended,
    }


def _generate_travelogue(payload: TravelogueGenerateRequest) -> dict[str, Any]:
    spots = payload.spots or []
    style = payload.style or "口语化"
    experience = payload.experience or ""

    spot_text = "、".join(spots) if spots else "龙门石窟、明堂天堂、白马寺等"
    style_hint = {
        "口语化": "像和好朋友聊天一样自然",
        "文艺": "文字细腻、有意境",
        "活泼": "活泼俏皮、充满元气",
        "正式": "条理清晰、描述准确",
    }.get(style, "自然流畅")

    content_lines = [
        f"# 洛阳旅行日记",
        "",
        f"这次我去了{spot_text}，想以{style}的风格，{style_hint}的方式记录这段旅程。",
        "",
        "## 行程亮点",
        "",
    ]

    for spot in spots or ["龙门石窟", "明堂天堂"]:
        info = ATTRACTION_SPOTS.get(spot)
        if info:
            content_lines.append(f"- **{spot}**：{info['reason']}")
            content_lines.append(f"  - 小贴士：{info['tips']}")
        else:
            content_lines.append(f"- **{spot}**：一处值得细细品味的地方。")

    if experience:
        content_lines.extend(
            [
                "",
                "## 我的旅行感悟",
                "",
                experience,
            ]
        )

    content_lines.extend(
        [
            "",
            "## 实用小贴士",
            "",
            "1. 提前预约门票与讲解，节省排队时间。",
            "2. 洛阳景点之间距离较远，建议打车或包车。",
            "3. 品尝当地特色美食，如牛肉汤、不翻汤、水席。",
            "4. 关注天气，合理安排户外与室内景点。",
            "",
            "愿每一次出发，都能带回一段难忘的故事。",
        ]
    )

    return {
        "title": f"洛阳{spot_text}之旅 · 旅行日记",
        "content": "\n".join(content_lines),
        "style": style,
        "spots": spots,
    }


def _fetch_knowledge_context(spots: list[str] | None = None, districts: list[str] | None = None) -> str:
    """从本地 ai_knowledge_item 与景点/非遗/美食数据中检索上下文，作为给 AI 的知识库。"""
    chunks: list[str] = []

    # 1) 景点知识点
    spot_names = spots or list(ATTRACTION_SPOTS.keys())
    for name in spot_names:
        if name in ATTRACTION_SPOTS:
            info = ATTRACTION_SPOTS[name]
            chunks.append(
                f"【景点】{name}：{info['reason']} 门票：{info['price']} 元/人，建议游玩时长 {info['durationMinutes']} 分钟。"
                f" 推荐门票：{info['ticketName']}。小贴士：{info['tips']}"
            )

    # 2) 非遗 / 美食 / 景点详情从数据库加载
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT title, content FROM ai_knowledge_item WHERE status='active' ORDER BY id DESC LIMIT 20")
                for row in cursor.fetchall() or []:
                    title = str(row.get("title") or "")
                    content = str(row.get("content") or "")
                    if title and content:
                        chunks.append(f"【知识】{title}：{content[:180]}")
    except Exception:
        pass

    # 3) 通用洛阳文化提示
    if districts:
        chunks.append(f"涉及洛阳市区县：{'、'.join(districts)}")

    return "\n".join(chunks)


async def _call_deepseek(system_prompt: str, user_prompt: str, json_schema: dict[str, Any], timeout_sec: float = 30.0) -> dict[str, Any]:
    """调用 DeepSeek Chat 接口并强制返回 JSON。"""
    import httpx

    api_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
    model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

    if not api_key:
        raise RuntimeError("缺少 DEEPSEEK_API_KEY")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.6,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=timeout_sec) as client:
        resp = await client.post(f"{base_url}/chat/completions", headers=headers, json=payload)
        if resp.status_code >= 400:
            raise RuntimeError(f"DeepSeek HTTP {resp.status_code}: {resp.text[:400]}")
        body = resp.json()

    if body.get("error"):
        raise RuntimeError(f"DeepSeek error: {body['error']}")

    choices = body.get("choices") or []
    if not choices:
        raise RuntimeError("DeepSeek 返回为空")

    content = choices[0].get("message", {}).get("content", "")
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(item.get("text", ""))
        content = "".join(parts)
    content = str(content).strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # 去掉 ```json ... ``` 包裹
        cleaned = re.sub(r"^```(?:json)?\s*", "", content, flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        return json.loads(cleaned)


async def _build_itinerary_plan_via_ai(payload: ItineraryPlanRequest) -> dict[str, Any]:
    import re

    days = max(1, min(payload.days or 1, 14))
    people_count = max(1, payload.peopleCount or 1)
    districts = payload.districts or []
    preferences = payload.preferences or []

    # 1) 构造本地知识库上下文
    kb_context = _fetch_knowledge_context(spots=list(ATTRACTION_SPOTS.keys()), districts=districts)

    # 2) 构造给 AI 的用户提示
    user_prompt = f"""请为用户生成一份 {days} 天的洛阳行程安排，严格按 JSON 返回。

用户需求：
- 区县：{ '、'.join(districts) if districts else '不限' }
- 偏好：{ '、'.join(preferences) if preferences else '不限' }
- 天数：{days} 天
- 人数：{people_count} 人
- 预算：{payload.budget if payload.budget else '不限'}

本地知识库（景点信息）：
{kb_context[:3000]}

必须返回如下 JSON 结构（中文），字段名保持不变：
{{
  "summary": "一句话总览",
  "estimatedCost": 预估总票价(整数，单位元),
  "days": [
    {{
      "day": 1,
      "title": "第1天 · 主题",
      "items": [
        {{
          "time": "09:00-12:00",
          "timeRange": "上午游览 景点名",
          "projectId": 1,
          "projectName": "景点名",
          "spotName": "景点名",
          "durationMinutes": 180,
          "ticketPrice": 90,
          "reason": "推荐理由",
          "tips": "游玩贴士"
        }}
      ]
    }}
  ],
  "recommendedTickets": [
    {{
      "ticketTypeId": 1,
      "name": "门票名称",
      "quantity": {people_count},
      "price": 90,
      "total": 90
    }}
  ]
}}

要求：
- 严格使用上述 JSON 结构，不要添加任何额外字段。
- 景点只能从本地知识库中选择（给出的景点列表），projectId / ticketTypeId / ticketPrice 等字段必须与知识库一致。
- 每天安排 1-2 个核心景点，时间、时长、票价合理。
- estimatedCost 为所有 recommendedTickets 的 total 之和。
- 不要输出 JSON 之外的任何文字或 Markdown。"""

    schema_hint: dict[str, Any] = {"type": "object"}

    result = await _call_deepseek(
        system_prompt="你是洛阳旅游规划专家，擅长结合本地景点数据生成结构化行程。只能输出合法 JSON。",
        user_prompt=user_prompt,
        json_schema=schema_hint,
        timeout_sec=45.0,
    )

    # 3) 结构兜底（若 AI 字段缺失则补齐）
    if not isinstance(result, dict):
        raise RuntimeError("AI 返回不是对象")

    days_list = result.get("days") or []
    normalized_days: list[dict[str, Any]] = []
    for day_idx, day in enumerate(days_list[:days]):
        if not isinstance(day, dict):
            continue
        items = day.get("items") or []
        norm_items: list[dict[str, Any]] = []
        for item in items:
            if not isinstance(item, dict):
                continue
            spot = str(item.get("spotName") or item.get("projectName") or "")
            info = ATTRACTION_SPOTS.get(spot, {})
            norm_items.append(
                {
                    "time": str(item.get("time") or ""),
                    "timeRange": str(item.get("timeRange") or ""),
                    "projectId": int(item.get("projectId") or info.get("projectId") or 0),
                    "projectName": str(item.get("projectName") or spot),
                    "spotName": spot,
                    "durationMinutes": int(item.get("durationMinutes") or info.get("durationMinutes") or 180),
                    "ticketPrice": int(item.get("ticketPrice") or info.get("price") or 0),
                    "reason": str(item.get("reason") or info.get("reason") or ""),
                    "tips": str(item.get("tips") or info.get("tips") or ""),
                }
            )
        normalized_days.append(
            {
                "day": int(day.get("day") or (day_idx + 1)),
                "title": str(day.get("title") or f"第 {day_idx + 1} 天 · 洛阳文化深度游"),
                "items": norm_items,
            }
        )

    if not normalized_days:
        raise RuntimeError("AI 未生成有效的 days 结构")

    return {
        "summary": str(result.get("summary") or f"已为你规划 {days} 天洛阳行程"),
        "estimatedCost": int(result.get("estimatedCost") or 0),
        "days": normalized_days,
        "recommendedTickets": result.get("recommendedTickets") or [],
    }


async def _generate_travelogue_via_ai(payload: TravelogueGenerateRequest) -> dict[str, Any]:
    spots = payload.spots or []
    style = payload.style or "口语化"
    experience = payload.experience or ""

    kb_context = _fetch_knowledge_context(spots=spots)

    user_prompt = f"""请生成一篇洛阳旅行日记，严格按 JSON 返回。

- 景点：{'、'.join(spots) if spots else '龙门石窟、明堂天堂'}
- 风格：{style}
- 我的游玩经历：{experience or '（无）'}

本地景点知识：
{kb_context[:2500]}

返回 JSON 结构：
{{
  "title": "日记标题",
  "content": "日记正文（使用 Markdown，不少于 400 字）",
  "style": "{style}",
  "spots": ["景点1","景点2"]
}}

要求：
- 严格 JSON 结构，不要输出额外内容。
- 正文自然流畅，结合本地知识与用户经历，避免空洞套话。
- 不要输出 JSON 之外的任何文字或 Markdown 包裹。"""

    schema_hint: dict[str, Any] = {"type": "object"}

    result = await _call_deepseek(
        system_prompt="你是资深旅行作家，擅长用中文生成真实、生动的旅行日记。只能输出合法 JSON。",
        user_prompt=user_prompt,
        json_schema=schema_hint,
        timeout_sec=45.0,
    )

    if not isinstance(result, dict):
        raise RuntimeError("AI 返回不是对象")

    content = str(result.get("content") or "").strip()
    if not content:
        raise RuntimeError("AI 未生成有效 content")

    return {
        "title": str(result.get("title") or f"洛阳旅行日记 · {'、'.join(spots) or '经典景点'}"),
        "content": content,
        "style": style,
        "spots": spots,
    }


def insert_chat_log(
    user_input: str,
    reply: str | None,
    actions: list[dict[str, Any]],
    latency_ms: int,
    status: str = "success",
) -> int | None:
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO ai_chat_log
                      (user_input, ai_reply, intent, actions_json, latency_ms, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        user_input,
                        reply,
                        detect_intent(user_input, actions),
                        json.dumps(actions, ensure_ascii=False),
                        latency_ms,
                        status,
                    ),
                )
                return int(cursor.lastrowid)
    except Exception:
        return None


app = FastAPI(title="AILuoYang AI Tourism Assistant", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_ai_tables()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-svc"}


@app.post("/api/ai/chat/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    chat_history = convert_chat_history(request.chat_history)

    async def event_stream():
        async for packet in get_ai_response(request.user_input, chat_history):
            yield f"data: {json.dumps(packet, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/api/ai/chat")
async def chat(request: LegacyChatRequest) -> dict[str, Any]:
    user_input = request.user_input or request.message
    if not user_input:
        return {"code": 400, "message": "user_input/message 不能为空", "data": None}

    started_at = time.perf_counter()
    chat_history = convert_chat_history(request.chat_history)
    reply_parts: list[str] = []
    actions: list[dict[str, Any]] = []

    async for packet in get_ai_response(user_input, chat_history):
        if packet.get("type") == "text" and packet.get("content"):
            reply_parts.append(str(packet["content"]))
        elif packet.get("type") == "card":
            card = packet.get("data") or {}
            if card.get("card_type") == "ticket_booking":
                actions.append(
                    {
                        "type": "show_ticket",
                        "ticketTypeId": card.get("ticket_type_id"),
                        "ticketName": card.get("ticket_type_name") or card.get("spot_name"),
                        "price": card.get("price"),
                        "date": card.get("date"),
                        "ticketCount": card.get("ticket_count") or 1,
                    }
                )

    reply = "".join(reply_parts)
    if not reply and actions:
        reply = "已为你找到可购买的票种，可以继续查看并下单。"
    elif not reply:
        reply = "我刚刚没有收到有效回复，请稍后再试。"

    latency_ms = int((time.perf_counter() - started_at) * 1000)
    chat_log_id = insert_chat_log(user_input, reply, actions, latency_ms)

    return ok(
        {
            "conversationId": request.conversationId or 0,
            "chatLogId": chat_log_id,
            "reply": reply,
            "actions": actions,
        }
    )


@app.post("/api/ai/itinerary/plans")
async def itinerary_plans(request: ItineraryPlanRequest) -> dict[str, Any]:
    try:
        plan = await _build_itinerary_plan_via_ai(request)
        return ok(plan)
    except Exception as exc:
        print(f"[itinerary] DeepSeek failed, fallback to local: {exc}")
        plan = _build_itinerary_plan(request)
        return ok(plan)


@app.post("/api/ai/travelogue/generate")
async def travelogue_generate(request: TravelogueGenerateRequest) -> dict[str, Any]:
    try:
        result = await _generate_travelogue_via_ai(request)
        return ok(result)
    except Exception as exc:
        print(f"[travelogue] DeepSeek failed, fallback to local: {exc}")
        result = _generate_travelogue(request)
        return ok(result)


@app.get("/api/ai/admin/overview")
async def admin_overview() -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM ai_chat_log")
            total_chats = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM ai_feedback")
            total_feedback = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM ai_inspiration WHERE status='active'")
            active_inspirations = cursor.fetchone()["total"]
            cursor.execute("SELECT COUNT(*) AS total FROM ai_knowledge_item WHERE status='active'")
            active_knowledge = cursor.fetchone()["total"]
            cursor.execute(
                """
                SELECT
                  COALESCE(SUM(prompt_tokens), 0) AS promptTokens,
                  COALESCE(SUM(completion_tokens), 0) AS completionTokens,
                  COALESCE(SUM(total_tokens), 0) AS totalTokens,
                  ROUND(COALESCE(AVG(latency_ms), 0), 0) AS avgLatencyMs
                FROM ai_chat_log
                """
            )
            usage = cursor.fetchone()
            cursor.execute(
                """
                SELECT intent, COUNT(*) AS count
                FROM ai_chat_log
                GROUP BY intent
                ORDER BY count DESC
                LIMIT 10
                """
            )
            intents = cursor.fetchall()

    total_tokens = int(usage["totalTokens"] or 0)
    cost_per_1k = float(0.002)
    return ok(
        {
            "totalChats": total_chats,
            "totalFeedback": total_feedback,
            "activeInspirations": active_inspirations,
            "activeKnowledge": active_knowledge,
            "tokenUsage": {
                **usage,
                "estimatedCost": round(total_tokens / 1000 * cost_per_1k, 4),
            },
            "intentDistribution": intents,
        }
    )


@app.get("/api/ai/admin/chat-logs")
async def list_chat_logs(page: int = 1, pageSize: int = 20) -> dict[str, Any]:
    return ok(paginated_query("ai_chat_log", page, pageSize))


@app.post("/api/ai/admin/feedback")
async def create_feedback(request: FeedbackRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ai_feedback (chat_log_id, user_id, rating, comment)
                VALUES (%s, %s, %s, %s)
                """,
                (request.chat_log_id, request.user_id, request.rating, request.comment),
            )
            feedback_id = cursor.lastrowid
    return ok({"id": feedback_id})


@app.get("/api/ai/admin/feedback")
async def list_feedback(page: int = 1, pageSize: int = 20) -> dict[str, Any]:
    return ok(paginated_query("ai_feedback", page, pageSize))


@app.get("/api/ai/admin/inspirations")
async def list_inspirations(page: int = 1, pageSize: int = 50) -> dict[str, Any]:
    return ok(paginated_query("ai_inspiration", page, pageSize))


@app.post("/api/ai/admin/inspirations")
async def create_inspiration(request: InspirationRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ai_inspiration (title, prompt, sort_order, status)
                VALUES (%s, %s, %s, %s)
                """,
                (request.title, request.prompt, request.sort_order, request.status),
            )
            item_id = cursor.lastrowid
    return ok({"id": item_id})


@app.put("/api/ai/admin/inspirations/{item_id}")
async def update_inspiration(item_id: int, request: InspirationRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_inspiration
                SET title=%s, prompt=%s, sort_order=%s, status=%s
                WHERE id=%s
                """,
                (request.title, request.prompt, request.sort_order, request.status, item_id),
            )
    return ok({"id": item_id})


@app.get("/api/ai/admin/persona")
async def get_persona() -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM ai_persona_config ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
    return ok(row)


@app.put("/api/ai/admin/persona")
async def update_persona(request: PersonaRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM ai_persona_config ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    """
                    UPDATE ai_persona_config
                    SET name=%s, welcome_message=%s, system_prompt=%s, model=%s, temperature=%s, status=%s
                    WHERE id=%s
                    """,
                    (
                        request.name,
                        request.welcome_message,
                        request.system_prompt,
                        request.model,
                        request.temperature,
                        request.status,
                        row["id"],
                    ),
                )
                persona_id = row["id"]
            else:
                cursor.execute(
                    """
                    INSERT INTO ai_persona_config
                      (name, welcome_message, system_prompt, model, temperature, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        request.name,
                        request.welcome_message,
                        request.system_prompt,
                        request.model,
                        request.temperature,
                        request.status,
                    ),
                )
                persona_id = cursor.lastrowid
    return ok({"id": persona_id})


@app.get("/api/ai/admin/knowledge")
async def list_knowledge(page: int = 1, pageSize: int = 20) -> dict[str, Any]:
    return ok(paginated_query("ai_knowledge_item", page, pageSize))


@app.post("/api/ai/admin/knowledge")
async def create_knowledge(request: KnowledgeRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ai_knowledge_item
                  (title, content, source_type, embedding_status, status)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    request.title,
                    request.content,
                    request.source_type,
                    request.embedding_status,
                    request.status,
                ),
            )
            item_id = cursor.lastrowid
    return ok({"id": item_id})


@app.put("/api/ai/admin/knowledge/{item_id}")
async def update_knowledge(item_id: int, request: KnowledgeRequest) -> dict[str, Any]:
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_knowledge_item
                SET title=%s, content=%s, source_type=%s, embedding_status=%s, status=%s
                WHERE id=%s
                """,
                (
                    request.title,
                    request.content,
                    request.source_type,
                    request.embedding_status,
                    request.status,
                    item_id,
                ),
            )
    return ok({"id": item_id})
