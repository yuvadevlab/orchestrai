"""
apps/intelligence/src/mode_router.py
Fast rule-based heuristic classifier and canonical system prompt instructions for AgentMode.
Parallels @orchestrai/agent and @orchestrai/prompts with identical lexical patterns.
"""

import re
from typing import Literal

AgentModeType = Literal["chat", "plan", "act", "auto"]

PLAN_PATTERNS = [
    re.compile(
        r"\b(plan|design|architect|roadmap|breakdown|strategy|steps to|how would we)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(decompose|outline the process|prepare a plan|milestones)\b",
        re.IGNORECASE,
    ),
]

ACT_PATTERNS = [
    re.compile(
        r"\b(create|build|delete|remove|deploy|execute|run|install|update|modify|refactor)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(write to|make the changes|push|commit|checkout|apply)\b",
        re.IGNORECASE,
    ),
]

CHAT_PATTERNS = [
    re.compile(
        r"\b(hi|hello|hey|greetings|thanks|thank you|who are you|what can you do)\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(explain|what is|tell me about|summarize|why does|describe|difference between)\b",
        re.IGNORECASE,
    ),
]

CHAT_MODE_INSTRUCTIONS = (
    "Operating Mode: CHAT.\n"
    "Focus on direct, helpful, conversational responses. "
    "Only invoke tools if the user explicitly requests an action, search, or data inspection."
)

PLAN_MODE_INSTRUCTIONS = (
    "Operating Mode: PLAN.\n"
    "Analyze the user's objective and deconstruct it into a logical, numbered plan of execution.\n"
    "Use read-only exploration tools to investigate context if necessary, but do NOT execute "
    "destructive modifications yet. Focus on architecture, verification criteria, and clear steps.\n"
    "When ready, format your plan in a structured ```json block with keys: planId, goal, and steps."
)

ACT_MODE_INSTRUCTIONS = (
    "Operating Mode: ACT.\n"
    "You are an autonomous action engine. Prioritize direct tool execution over conversational explanation. "
    "Perform the necessary operations sequentially and conclude when the goal is achieved."
)

AUTO_MODE_INSTRUCTIONS = (
    "Operating Mode: AUTO.\n"
    "You are an adaptive orchestrator. Assess task complexity dynamically. "
    "For complex multi-step workflows, briefly state your intended approach, "
    "then execute tools methodically, verify results, and conclude with a concise summary."
)

PLATFORM_INVARIANTS_PROMPT = (
    "Platform Invariants & Rules:\n"
    "1. Hard 250-Line Maximum Rule: Keep all files strictly under 250 lines.\n"
    "2. Explanatory Comments & JSDoc/Docstrings: All exported symbols require full documentation.\n"
    "3. Strict Typing & Canonical Enums: Zero raw string literals for statuses, roles, or modes.\n"
    "4. Zero Hardcoded Fallback Models: All models must be DB- or env-driven.\n"
    "5. Sandbox Isolation: All file and tool operations must respect directory boundaries."
)

MODE_INSTRUCTIONS_MAP: dict[str, str] = {
    "chat": CHAT_MODE_INSTRUCTIONS,
    "plan": PLAN_MODE_INSTRUCTIONS,
    "act": ACT_MODE_INSTRUCTIONS,
    "auto": AUTO_MODE_INSTRUCTIONS,
}


def detect_mode(prompt: str, fallback: AgentModeType = "act") -> AgentModeType:
    """
    Evaluates incoming user prompt against lexical patterns to pick the appropriate AgentMode.

    Args:
        prompt: Raw prompt text from user.
        fallback: Default mode if no patterns match.

    Returns:
        One of 'plan', 'act', 'chat', or fallback.
    """
    text = prompt.strip()
    if not text:
        return fallback

    # 1. Check for explicit planning cues
    for pat in PLAN_PATTERNS:
        if pat.search(text):
            return "plan"

    # 2. Check for action / mutation cues
    for pat in ACT_PATTERNS:
        if pat.search(text):
            return "act"

    # 3. Check for conversational / informational cues
    for pat in CHAT_PATTERNS:
        if pat.search(text):
            return "chat"

    return fallback


def get_mode_instructions(mode: str) -> str:
    """Returns canonical system instructions for the specified agent mode."""
    return MODE_INSTRUCTIONS_MAP.get(mode.lower(), AUTO_MODE_INSTRUCTIONS)
