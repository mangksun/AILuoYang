from __future__ import annotations

import json
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
