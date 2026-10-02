"""
apps/intelligence/src/server.py
FastAPI HTTP and streaming server exposing LangGraph execution and Conversational RAG.
"""

from typing import Any, Optional
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from .config import settings
from .graph import create_agent_graph
from .retrieval import retrieve_selective_history

app = FastAPI(
    title="OrchestrAI Intelligence Service",
    description="LangGraph autonomous reasoning and Conversational RAG sidecar",
    version="0.1.0",
)

compiled_graph = create_agent_graph()


class ExecuteRequest(BaseModel):
    """Execution dispatch request payload."""
    execution_id: str = Field(..., description="Unique execution UUID")
    agent_id: str = Field(..., description="Agent identifier")
    tenant_id: Optional[str] = Field(None, description="Optional tenant ID")
    input_prompt: str = Field(..., description="Incoming user query")
    model_name: Optional[str] = Field(None, description="Model to execute")
    system_prompt: Optional[str] = Field(None, description="System instructions")
    tools: list[dict[str, Any]] = Field(default_factory=list, description="Available tool schemas")
    history: list[dict[str, Any]] = Field(default_factory=list, description="Prior message history")
    max_turns: int = Field(default=20, description="Max allowed execution steps")
    max_context_tokens: int = Field(default=8192, description="Context window size")


class ExecuteResponse(BaseModel):
    """Execution dispatch response payload."""
    execution_id: str
    status: str
    final_output: Optional[str] = None
    turn_count: int
    context_tokens: int
    evaluation_score: float
    error: Optional[str] = None


class SelectiveContextRequest(BaseModel):
    """Selective context compression request payload."""
    current_prompt: str
    history: list[dict[str, Any]]
    top_k: int = 4
    min_similarity: float = 0.4
    always_include_last: int = 2


@app.get("/health")
@app.get("/ready")
async def health_check():
    """Service health probe endpoint."""
    return {
        "status": "ok",
        "service": "orchestrai-intelligence",
        "ollama_host": settings.ollama_host,
    }


@app.post("/execute", response_model=ExecuteResponse)
async def execute_agent(req: ExecuteRequest):
    """
    Executes an autonomous agent run through the compiled LangGraph StateGraph.
    """
    resolved_model = (
        req.model_name
        or settings.default_model_name
    )

    # Enforce model requirement: no hardcoded defaults allowed
    if not resolved_model:
        raise HTTPException(
            status_code=400,
            detail="No model specified in request and DEFAULT_MODEL_NAME environment variable is not set",
        )

    # 1. Apply conversational RAG to prune older non-relevant history
    pruned_history = await retrieve_selective_history(
        current_prompt=req.input_prompt,
        full_history=req.history,
    )

    # 2. Append current user prompt to message stream
    messages = [
        *pruned_history,
        {"role": "user", "content": req.input_prompt},
    ]

    initial_state = {
        "messages": messages,
        "execution_id": req.execution_id,
        "agent_id": req.agent_id,
        "tenant_id": req.tenant_id,
        "model_name": resolved_model,
        "system_prompt": req.system_prompt or "",
        "tools": req.tools,
        "turn_count": 0,
        "max_turns": req.max_turns,
        "context_tokens": 0,
        "max_context_tokens": req.max_context_tokens,
        "pending_tool_calls": [],
        "tool_results": [],
        "evaluation_score": 1.0,
        "evaluation_feedback": "",
        "is_complete": False,
        "final_output": None,
        "error": None,
    }

    try:
        final_state = await compiled_graph.ainvoke(initial_state)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"LangGraph execution error: {str(exc)}")

    status = "failed" if final_state.get("error") else "completed"

    return ExecuteResponse(
        execution_id=req.execution_id,
        status=status,
        final_output=final_state.get("final_output"),
        turn_count=final_state.get("turn_count", 0),
        context_tokens=final_state.get("context_tokens", 0),
        evaluation_score=final_state.get("evaluation_score", 1.0),
        error=final_state.get("error"),
    )


@app.post("/context/selective")
async def selective_context(req: SelectiveContextRequest):
    """
    Standalone Conversational RAG endpoint returning pruned, semantically relevant history.
    """
    filtered = await retrieve_selective_history(
        current_prompt=req.current_prompt,
        full_history=req.history,
        top_k=req.top_k,
        min_similarity=req.min_similarity,
        always_include_last=req.always_include_last,
    )
    return {"messages": filtered}


def main():
    """Service entry point for direct CLI startup."""
    uvicorn.run(
        "src.server:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )


if __name__ == "__main__":
    main()
