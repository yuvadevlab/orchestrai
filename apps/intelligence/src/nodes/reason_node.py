"""
apps/intelligence/src/nodes/reason_node.py
LLM reasoning node that generates thoughts, detects tool invocations, or produces final answers.
"""

from typing import Any

import httpx

from ..config import settings
from ..state import AgentState


async def reason_node(state: AgentState) -> dict[str, Any]:
    """
    Invokes the LLM to analyze the conversation and decide on next actions.

    Args:
        state: Current immutable AgentState.

    Returns:
        State updates containing newly generated assistant message and detected tool calls.
    """
    model_name = state["model_name"]
    # Guard against unconfigured model: fail fast with actionable guidance
    if not model_name:
        return {
            "error": "No model configured on agent definition and DEFAULT_MODEL_NAME is not set",
            "is_complete": True,
        }

    # Prepare formatted prompt payload for Ollama
    messages_payload = []
    if state.get("system_prompt"):
        messages_payload.append({"role": "system", "content": state["system_prompt"]})

    for m in state["messages"]:
        messages_payload.append({"role": m["role"], "content": m["content"]})

    tools_payload = state.get("tools") or []

    payload: dict[str, Any] = {
        "model": model_name,
        "messages": messages_payload,
        "stream": False,
        "options": {
            "temperature": 0.2,
        },
    }

    # Only attach tool schemas if tools are registered
    if tools_payload:
        payload["tools"] = tools_payload

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            resp = await client.post(
                f"{settings.ollama_host}/api/chat",
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:  # noqa: BLE001
            # Catch HTTP connection or parsing failures from Ollama host
            return {
                "error": f"Ollama reasoning error: {exc!s}",
                "is_complete": True,
            }

    message = data.get("message", {})
    content = message.get("content", "")
    tool_calls = message.get("tool_calls", [])

    new_turn_count = state["turn_count"] + 1
    eval_tokens = data.get("eval_count", 0) + data.get("prompt_eval_count", 0)

    # Detect if model decided to terminate or call tools
    is_terminal = len(tool_calls) == 0

    return {
        "messages": [
            {"role": "assistant", "content": content, "tool_calls": tool_calls}
        ],
        "pending_tool_calls": tool_calls,
        "turn_count": new_turn_count,
        "context_tokens": eval_tokens,
        "is_complete": is_terminal,
        "final_output": content if is_terminal else None,
    }
