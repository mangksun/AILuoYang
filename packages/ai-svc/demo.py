from __future__ import annotations

import asyncio
import json

from app.assistant import get_ai_response


async def demo_case(title: str, user_input: str) -> None:
    print("\n" + "=" * 80)
    print(title)
    print(f"用户输入：{user_input}")
    print("-" * 80)

    async for packet in get_ai_response(user_input):
        print(json.dumps(packet, ensure_ascii=False))


async def main() -> None:
    await demo_case("场景 A：纯咨询闲聊", "北京故宫有什么好玩的？")
    await demo_case("场景 B：购票意图触发", "我想买张明天去故宫的票")


if __name__ == "__main__":
    asyncio.run(main())
