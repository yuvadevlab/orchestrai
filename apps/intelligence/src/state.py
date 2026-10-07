"""
apps/intelligence/src/state.py
State definitions for the LangGraph agent graph.
Provides append-only message reducers, context budgeting, and node coordination.
"""

import operator
from typing import Annotated, Any, TypedDict


def merge_dicts(a: dict[str, Any], b: dict[str, Any]) -> dict[str, Any]:
    """Reducer combining dictionary updates shallowly."""
    res = dict(a)
    res.update(b)
    return res


class AgentState(TypedDict):
    """
    Immutable state passed between discrete LangGraph reasoning nodes.
    Each key dictates graph routing and execution progression.
    """

    # Primary append-only message history
    messages: Annotated[list[dict[str, Any]], operator.add]

    # Identifiers and metadata
    execution_id: str
    agent_id: str
    tenant_id: str | None
    model_name: str
    system_prompt: str

    # Available tools and capability schemas
    tools: list[dict[str, Any]]

    # Step and token budgets
    turn_count: int
    max_turns: int
    context_tokens: int
    max_context_tokens: int

    # Ephemeral step state
    pending_tool_calls: list[dict[str, Any]]
    tool_results: list[dict[str, Any]]

    # Self-evaluation feedback and scores
    evaluation_score: float
    evaluation_feedback: str

    # Terminal flags
    is_complete: bool
    final_output: str | None
    error: str | None
