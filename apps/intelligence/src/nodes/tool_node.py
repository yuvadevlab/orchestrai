"""
apps/intelligence/src/nodes/tool_node.py
Tool execution node that dispatches tool calls and captures outputs.
Supports parallel tool execution and forwarding to the OrchestrAI Gateway.
"""

import json
from typing import Any
import httpx
from ..config import settings
from ..state import AgentState


async def _execute_single_tool(
    tool_call: dict[str, Any],
    execution_id: str,
    tenant_id: str | None,
) -> dict[str, Any]:
    """
    Dispatches a discrete tool execution request to the OrchestrAI gateway tool engine.
    """
    func = tool_call.get("function", {})
    tool_name = func.get("name", "unknown_tool")
    raw_args = func.get("arguments", {})

    # Arguments can arrive as dict or json-encoded string
    if isinstance(raw_args, str):
        try:
            parsed_args = json.loads(raw_args)
        except Exception:
            parsed_args = {"raw": raw_args}
    else:
        parsed_args = raw_args

    headers = {"Content-Type": "application/json"}
    if tenant_id:
        headers["x-tenant-id"] = tenant_id

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                f"{settings.gateway_url}/tools/execute",
                headers=headers,
                json={
                    "tool": tool_name,
                    "arguments": parsed_args,
                    "executionId": execution_id,
                },
            )
            if resp.status_code == 200:
                output = resp.json().get("result", "")
            else:
                output = f"Tool execution failed with status {resp.status_code}: {resp.text}"
        except Exception as exc:
            output = f"Tool dispatch exception: {str(exc)}"

    return {
        "tool_call_id": tool_call.get("id", tool_name),
        "name": tool_name,
        "content": str(output),
    }


async def tool_node(state: AgentState) -> dict[str, Any]:
    """
    Executes all pending tool calls and appends their outputs to conversation messages.
    
    Args:
        state: Current immutable AgentState.
        
    Returns:
        State updates containing formatted tool messages and execution logs.
    """
    pending = state.get("pending_tool_calls") or []
    if not pending:
        return {"tool_results": [], "pending_tool_calls": []}

    results = []
    messages = []

    for tool_call in pending:
        res = await _execute_single_tool(
            tool_call,
            execution_id=state["execution_id"],
            tenant_id=state.get("tenant_id"),
        )
        results.append(res)
        messages.append({
            "role": "tool",
            "name": res["name"],
            "content": res["content"],
            "tool_call_id": res["tool_call_id"],
        })

    return {
        "messages": messages,
        "tool_results": results,
        "pending_tool_calls": [],
    }
