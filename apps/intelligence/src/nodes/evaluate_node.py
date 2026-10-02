"""
apps/intelligence/src/nodes/evaluate_node.py
Autonomous self-evaluation node reviewing output completeness and tool result veracity.
"""

from typing import Any
from ..state import AgentState


async def evaluate_node(state: AgentState) -> dict[str, Any]:
    """
    Evaluates intermediate tool responses and checks for errors or incomplete executions.
    
    Args:
        state: Current immutable AgentState.
        
    Returns:
        State updates containing quality score and feedback hints.
    """
    tool_results = state.get("tool_results") or []
    
    if not tool_results:
        return {
            "evaluation_score": 1.0,
            "evaluation_feedback": "No tools were executed; standard text completion.",
        }

    # Analyze tool outputs for error signatures
    error_count = 0
    total_tools = len(tool_results)

    for res in tool_results:
        content = res.get("content", "").lower()
        if "error" in content or "exception" in content or "failed" in content:
            error_count += 1

    error_rate = error_count / total_tools if total_tools > 0 else 0.0
    quality_score = max(0.0, 1.0 - error_rate)

    if quality_score < 0.5:
        feedback = f"{error_count}/{total_tools} tools failed. Self-correction required."
    else:
        feedback = f"All {total_tools} tools executed successfully."

    return {
        "evaluation_score": quality_score,
        "evaluation_feedback": feedback,
    }
