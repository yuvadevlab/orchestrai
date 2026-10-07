"""
apps/intelligence/src/graph/agent_graph.py
LangGraph StateGraph constructor defining node topology, conditional edges, and execution bounds.
"""

from typing import Literal

from langgraph.graph import END, START, StateGraph

from ..config import settings
from ..nodes import compact_node, evaluate_node, reason_node, tool_node
from ..state import AgentState


def route_after_reason(state: AgentState) -> Literal["tools", "__end__"]:
    """
    Decides whether to execute tools or terminate the reasoning process.
    """
    if state.get("error"):
        return END

    if state.get("is_complete"):
        return END

    # Enforce maximum autonomous turn limit to prevent infinite loops
    if state["turn_count"] >= state["max_turns"]:
        return END

    pending_calls = state.get("pending_tool_calls") or []
    if len(pending_calls) > 0:
        return "tools"

    return END


def route_after_evaluate(state: AgentState) -> Literal["compact", "reason"]:
    """
    Checks token consumption against context limits to determine if compaction is needed.
    """
    tokens = state.get("context_tokens", 0)
    max_tokens = state.get("max_context_tokens", 8192)
    threshold = settings.context_compaction_threshold

    # Trigger compaction when context utilization exceeds threshold fraction
    if max_tokens > 0 and (tokens / max_tokens) >= threshold:
        return "compact"

    return "reason"


def create_agent_graph():
    """
    Constructs and compiles the full LangGraph agent execution graph.

    Graph Topology:
      START -> reason
      reason -> [has tools? -> tools | complete/max steps? -> END]
      tools -> evaluate
      evaluate -> [near token limit? -> compact | else -> reason]
      compact -> reason

    Returns:
        Compiled LangGraph runner ready for asynchronous invocation.
    """
    builder = StateGraph(AgentState)

    # 1. Register discrete graph nodes
    builder.add_node("reason", reason_node)
    builder.add_node("tools", tool_node)
    builder.add_node("evaluate", evaluate_node)
    builder.add_node("compact", compact_node)

    # 2. Add root entry edge
    builder.add_edge(START, "reason")

    # 3. Add conditional router after reasoning
    builder.add_conditional_edges(
        "reason",
        route_after_reason,
        {
            "tools": "tools",
            "__end__": END,
        },
    )

    # 4. Pipeline tools to self-evaluation
    builder.add_edge("tools", "evaluate")

    # 5. Route after evaluation to either compact or loop back to reason
    builder.add_conditional_edges(
        "evaluate",
        route_after_evaluate,
        {
            "compact": "compact",
            "reason": "reason",
        },
    )

    # 6. Compaction re-enters reasoning loop
    builder.add_edge("compact", "reason")

    return builder.compile()
