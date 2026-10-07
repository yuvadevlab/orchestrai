"""
apps/intelligence/src/nodes/compact_node.py
Context compaction node that compresses intermediate conversation history when nearing window limits.
"""

from typing import Any
import httpx
from ..config import settings
from ..state import AgentState


async def compact_node(state: AgentState) -> dict[str, Any]:
    """
    Summarizes older conversation turns to reclaim token budget without losing context.

    Args:
        state: Current immutable AgentState.

    Returns:
        Compacted message history and updated context token metrics.
    """
    messages = state.get("messages") or []
    if len(messages) <= 4:
        return {"messages": messages}

    # Retain the first turn and the last 2 turns, compress the middle turns
    first_msg = messages[0]
    middle_msgs = messages[1:-2]
    recent_msgs = messages[-2:]

    middle_text = "\n".join(
        [f"{m.get('role')}: {m.get('content')}" for m in middle_msgs]
    )

    summary_prompt = (
        "Summarize the following intermediate actions, tool calls, and responses "
        "concisely in under 150 words while preserving critical facts:\n\n"
        f"{middle_text}"
    )

    summary_content = "Context compacted."
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                f"{settings.ollama_host}/api/generate",
                json={
                    "model": state["model_name"],
                    "prompt": summary_prompt,
                    "stream": False,
                },
            )
            if resp.status_code == 200:
                summary_content = resp.json().get(
                    "response", "Intermediate history summarized."
                )
        except Exception:
            summary_content = f"Summary of {len(middle_msgs)} prior intermediate steps."

    compacted_middle = {
        "role": "system",
        "content": f"[Previous Execution History Summary]: {summary_content}",
    }

    new_messages = [first_msg, compacted_middle, *recent_msgs]

    return {
        "messages": new_messages,
        "context_tokens": int(state.get("context_tokens", 4000) * 0.4),
    }
