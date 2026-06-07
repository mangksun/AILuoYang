from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Any, Iterator
from urllib.parse import urlparse

import pymysql
from pymysql.cursors import DictCursor


def _database_config() -> dict[str, Any]:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        parsed = urlparse(database_url)
        return {
            "host": parsed.hostname or "localhost",
            "port": parsed.port or 3306,
            "user": parsed.username or "root",
            "password": parsed.password or "",
            "database": parsed.path.lstrip("/") or "ticketing",
        }

    return {
        "host": os.getenv("MYSQL_HOST", "localhost"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", "root123456"),
        "database": os.getenv("MYSQL_DATABASE", "ticketing"),
    }


@contextmanager
def get_connection() -> Iterator[pymysql.connections.Connection]:
    conn = pymysql.connect(
        **_database_config(),
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=False,
    )
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_ai_tables() -> None:
    statements = [
        """
        CREATE TABLE IF NOT EXISTS ai_chat_log (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          session_id VARCHAR(64) NULL,
          user_input TEXT NOT NULL,
          ai_reply TEXT NULL,
          intent VARCHAR(50) NULL,
          actions_json TEXT NULL,
          latency_ms INT NULL,
          prompt_tokens INT DEFAULT 0,
          completion_tokens INT DEFAULT 0,
          total_tokens INT DEFAULT 0,
          status VARCHAR(20) NOT NULL DEFAULT 'success',
          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """,
        """
        CREATE TABLE IF NOT EXISTS ai_feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          chat_log_id INT NOT NULL,
          user_id INT NULL,
          rating VARCHAR(20) NOT NULL,
          comment TEXT NULL,
          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """,
        """
        CREATE TABLE IF NOT EXISTS ai_inspiration (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          prompt TEXT NOT NULL,
          sort_order INT NOT NULL DEFAULT 0,
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """,
        """
        CREATE TABLE IF NOT EXISTS ai_persona_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL DEFAULT '洛灵儿',
          welcome_message TEXT NULL,
          system_prompt TEXT NULL,
          model VARCHAR(100) NULL,
          temperature DECIMAL(4,2) NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """,
        """
        CREATE TABLE IF NOT EXISTS ai_knowledge_item (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          content MEDIUMTEXT NOT NULL,
          source_type VARCHAR(30) NOT NULL DEFAULT 'manual',
          embedding_status VARCHAR(20) NOT NULL DEFAULT 'pending',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        """,
    ]

    with get_connection() as conn:
        with conn.cursor() as cursor:
            for statement in statements:
                cursor.execute(statement)

            cursor.execute("SELECT COUNT(*) AS count FROM ai_inspiration")
            if cursor.fetchone()["count"] == 0:
                cursor.executemany(
                    "INSERT INTO ai_inspiration (title, prompt, sort_order, status) VALUES (%s, %s, %s, %s)",
                    [
                        ("两天洛阳文化游", "帮我安排两天洛阳文化游，并推荐适合购买的门票", 10, "active"),
                        ("龙门石窟购票", "我想买龙门石窟门票，有什么推荐？", 20, "active"),
                    ],
                )

            cursor.execute("SELECT COUNT(*) AS count FROM ai_persona_config")
            if cursor.fetchone()["count"] == 0:
                cursor.execute(
                    """
                    INSERT INTO ai_persona_config
                      (name, welcome_message, system_prompt, model, temperature, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        "洛灵儿",
                        "你好，我是洛灵儿，可以帮你规划洛阳游玩路线和购票。",
                        "保持亲和、准确、合规，不编造实时票价和库存。",
                        os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
                        float(os.getenv("AI_TEMPERATURE", "0.4")),
                        "active",
                    ),
                )
