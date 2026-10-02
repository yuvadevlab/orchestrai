"""
apps/intelligence/src/retrieval/conversational_rag.py
Conversational RAG for selective context injection.
Retrieves only semantically relevant previous turns for the current prompt instead of full history.
"""

from typing import Any
import math
import httpx
from ..config import settings


def _cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Computes cosine similarity between two floating-point vectors."""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


async def embed_turn(text: str, model_name: str | None = None) -> list[float]:
    """
    Computes dense vector embedding for text using Ollama embeddings endpoint.
    Falls back to deterministic hash embedding if embedding model is unavailable.
    """
    # Prefer explicit embedding model or general model from settings
    resolved_model = model_name or settings.default_model_name or "nomic-embed-text"

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.post(
                f"{settings.ollama_host}/api/embeddings",
                json={
                    "model": resolved_model,
                    "prompt": text,
                },
            )
            if resp.status_code == 200:
                return resp.json().get("embedding", [])
        except Exception:
            pass

    # Deterministic fallback vector for offline or mock environments
    dim = 64
    vec = [0.0] * dim
    for i, ch in enumerate(text[:dim]):
        vec[i % dim] += ord(ch) / 255.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


async def retrieve_selective_history(
    current_prompt: str,
    full_history: list[dict[str, Any]],
    top_k: int = 4,
    min_similarity: float = 0.4,
    always_include_last: int = 2,
) -> list[dict[str, Any]]:
    """
    Filters conversation history to only include turns semantically relevant to the current prompt.
    Strategy:
      1. Always keep system prompt (if present)
      2. Always keep last `always_include_last` turns for immediate conversational flow
      3. For older turns, score similarity against current prompt embedding
      4. Select top_k older turns, merge, and preserve original chronological order

    Args:
        current_prompt: Incoming user prompt.
        full_history: Full list of past conversation message objects.
        top_k: Maximum number of older turns to selectively retrieve.
        min_similarity: Cosine similarity cutoff threshold.
        always_include_last: Number of recent turns to always retain.

    Returns:
        Filtered, chronologically ordered subset of messages.
    """
    if len(full_history) <= always_include_last + 1:
        return list(full_history)

    system_messages = [m for m in full_history if m.get("role") == "system"]
    conversation_messages = [m for m in full_history if m.get("role") != "system"]

    # Recent turns to preserve intact
    recent_messages = conversation_messages[-always_include_last:]
    older_messages = conversation_messages[:-always_include_last]

    if not older_messages:
        return [*system_messages, *recent_messages]

    prompt_vector = await embed_turn(current_prompt)

    # Score older messages
    scored_messages = []
    for idx, msg in enumerate(older_messages):
        content = msg.get("content", "")
        msg_vector = await embed_turn(content)
        similarity = _cosine_similarity(prompt_vector, msg_vector)
        # Recency weighting bonus
        recency_weight = 1.0 / (1.0 + (len(older_messages) - idx) * 0.1)
        final_score = (similarity * 0.7) + (recency_weight * 0.3)

        if final_score >= min_similarity:
            scored_messages.append((final_score, idx, msg))

    # Sort descending by score and pick top_k
    scored_messages.sort(key=lambda x: x[0], reverse=True)
    selected_scored = scored_messages[:top_k]

    # Re-sort selected messages chronologically by original index
    selected_scored.sort(key=lambda x: x[1])
    selected_older = [item[2] for item in selected_scored]

    return [*system_messages, *selected_older, *recent_messages]
