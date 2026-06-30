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


class CompanionChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    chat_history: list[dict[str, Any]] = Field(default_factory=list)


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


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """计算两点之间的距离（米），使用 Haversine 公式"""
    import math
    R = 6371000  # 地球半径（米）
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def get_nearby_pois(latitude: float, longitude: float, poi_type: str, radius: int = 1000, limit: int = 20) -> list[dict[str, Any]]:
    """查询附近的POI"""
    table_map = {
        "attraction": "attraction",
        "food": "food",
        "rest": "rest_place",
        "shopping": "shopping_place",
    }
    table = table_map.get(poi_type)
    if not table:
        return []

    with get_connection() as conn:
        with conn.cursor() as cursor:
            # 查询所有 POI（不检查 status 列，因为部分表没有这个列）
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()

    # 计算距离并过滤
    result = []
    for row in rows:
        # 跳过状态为 disabled 的记录（如果有 status 列）
        if row.get("status") == "disabled":
            continue
        lat = float(row.get("latitude", 0))
        lon = float(row.get("longitude", 0))
        if lat == 0 or lon == 0:
            continue
        distance = calculate_distance(latitude, longitude, lat, lon)
        if distance <= radius:
            row["distance"] = round(distance)
            # 解析 JSON 字段
            for field in ["images", "tags", "facilities", "traffic"]:
                if field in row and row[field]:
                    try:
                        row[field] = json.loads(row[field])
                    except (json.JSONDecodeError, TypeError):
                        pass
            # 确保所有字符串字段都是 UTF-8 编码
            for key, value in row.items():
                if isinstance(value, bytes):
                    try:
                        row[key] = value.decode('utf-8')
                    except UnicodeDecodeError:
                        row[key] = value.decode('latin-1')
            result.append(row)

    # 按距离排序
    result.sort(key=lambda x: x["distance"])
    return result[:limit]


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


# ==================== AI 伴游接口 ====================


@app.get("/api/ai/companion/nearby")
async def companion_nearby(
    type: str,
    latitude: float,
    longitude: float,
    radius: int = 1000,
    limit: int = 20,
) -> dict[str, Any]:
    """查询附近POI"""
    try:
        if type not in ("attraction", "food", "rest", "shopping"):
            return {"code": 400, "message": "type 参数无效，可选：attraction/food/rest/shopping", "data": None}

        pois = get_nearby_pois(latitude, longitude, type, radius, limit)
        return ok({"list": pois, "total": len(pois), "type": type})
    except Exception as e:
        print(f"[nearby] Error: {e}")
        import traceback
        traceback.print_exc()
        return {"code": 500, "message": str(e), "data": None}


@app.get("/api/ai/companion/reverse-geocode")
async def reverse_geocode(latitude: float, longitude: float) -> dict[str, Any]:
    """逆地理编码，获取位置名称"""
    import httpx

    api_key = os.getenv("AMAP_KEY", "5e497098fb774c21bd0dee99fd11c904")
    location = f"{longitude},{latitude}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://restapi.amap.com/v3/geocode/regeo",
                params={
                    "key": api_key,
                    "location": location,
                    "extensions": "base",
                },
            )
            data = resp.json()

        if data.get("status") == "1" and data.get("regeocode"):
            address = data["regeocode"].get("formatted_address", "")
            address_component = data["regeocode"].get("addressComponent", {})
            district = address_component.get("district", "")
            return ok({
                "address": address,
                "district": district,
                "province": address_component.get("province", ""),
                "city": address_component.get("city", ""),
            })
    except Exception as e:
        print(f"[reverse-geocode] Error: {e}")

    return ok({"address": "洛阳", "district": "洛阳"})


async def search_nearby_pois(latitude: float, longitude: float, types: str, radius: int = 2000, limit: int = 10) -> list[dict[str, Any]]:
    """调用高德POI搜索API获取附近地点"""
    import httpx

    api_key = os.getenv("AMAP_KEY", "171676a3687c77f79c40bb81e17dca9e")
    location = f"{longitude},{latitude}"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://restapi.amap.com/v3/place/around",
                params={
                    "key": api_key,
                    "location": location,
                    "radius": radius,
                    "types": types,
                    "offset": limit,
                    "page": 1,
                    "extensions": "base",
                },
            )
            data = resp.json()

        if data.get("status") == "1" and data.get("pois"):
            result = []
            for poi in data["pois"]:
                result.append({
                    "name": poi.get("name", ""),
                    "address": poi.get("address", ""),
                    "distance": poi.get("distance", ""),
                    "type": poi.get("type", ""),
                    "tel": poi.get("tel", ""),
                })
            return result
    except Exception as e:
        print(f"[search_nearby_pois] Error: {e}", file=__import__('sys').stderr)

    return []


@app.post("/api/ai/companion/chat")
async def companion_chat(request: CompanionChatRequest) -> dict[str, Any]:
    """伴游对话接口 - 后端调用高德POI搜索"""
    try:
        started_at = time.perf_counter()

        # 调用高德POI搜索API查询附近地点
        nearby_foods = await search_nearby_pois(request.latitude, request.longitude, "050000", 2000, 5)
        nearby_spots = await search_nearby_pois(request.latitude, request.longitude, "110000", 2000, 5)
        nearby_hotels = await search_nearby_pois(request.latitude, request.longitude, "100000", 2000, 3)
        nearby_shopping = await search_nearby_pois(request.latitude, request.longitude, "060000|070000", 2000, 3)

        # 构造位置上下文
        location_context = ""
        if nearby_foods:
            location_context += "附近美食：" + "、".join([f"{f['name']}({f['distance']}米)" for f in nearby_foods]) + "\n"
        if nearby_spots:
            location_context += "附近景点：" + "、".join([f"{s['name']}({s['distance']}米)" for s in nearby_spots]) + "\n"
        if nearby_hotels:
            location_context += "附近住宿：" + "、".join([f"{h['name']}({h['distance']}米)" for h in nearby_hotels]) + "\n"
        if nearby_shopping:
            location_context += "附近购物：" + "、".join([f"{s['name']}({s['distance']}米)" for s in nearby_shopping]) + "\n"

        # 构造 system prompt
        system_prompt = f"""你是智能旅游助手"洛灵儿"，正在为用户提供实时伴游服务。

用户当前位置：纬度 {request.latitude}，经度 {request.longitude}

以下是用户附近的真实POI数据（来自高德地图）：
{location_context if location_context else "暂未查询到附近POI信息。"}

重要指令：
1. 你必须基于上述真实POI数据回答用户问题，不要推荐数据中没有的地点
2. 如果用户询问附近有什么，直接列出上述POI数据中的地点名称和距离
3. 回答要简洁、友好、实用
4. 使用中文回答"""

        chat_history = convert_chat_history(request.chat_history)

        reply_parts: list[str] = []
        async for packet in get_ai_response(request.message, chat_history, system_prompt):
            if packet.get("type") == "text" and packet.get("content"):
                reply_parts.append(str(packet["content"]))

        reply = "".join(reply_parts)
        if not reply:
            reply = "抱歉，我暂时无法回答这个问题，请稍后再试。"

        latency_ms = int((time.perf_counter() - started_at) * 1000)
        chat_log_id = insert_chat_log(request.message, reply, [], latency_ms, "companion")

        return ok({
            "reply": reply,
            "chatLogId": chat_log_id,
        })
    except Exception as e:
        import sys
        print(f"[companion] Error: {e}", file=sys.stderr)
        return {"code": 500, "message": "服务器内部错误", "data": None}
