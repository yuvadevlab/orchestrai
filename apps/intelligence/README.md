# OrchestrAI Intelligence Service

Autonomous LangGraph reasoning engine and Conversational RAG sidecar for the OrchestrAI platform.

## Architecture

- **Engine**: LangGraph Directed StateGraph with declarative conditional routing.
- **Nodes**:
  - `reason`: Ollama LLM reasoning and function call detection.
  - `tools`: Dispatches tool requests via upstream gateway tool executor.
  - `evaluate`: Self-evaluation quality gate computing veracity and error rates.
  - `compact`: Context window compaction when approaching token boundaries.
- **Conversational RAG**: Embeds past turns and selectively injects only semantically relevant history for the current prompt.

## Setup & Running

```bash
# Create local virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start service
python -m src.server
```

## Environment Variables

| Variable             | Description                 | Default                  |
| -------------------- | --------------------------- | ------------------------ |
| `HOST`               | Bind address                | `0.0.0.0`                |
| `PORT`               | HTTP listen port            | `8082`                   |
| `OLLAMA_HOST`        | Ollama daemon endpoint      | `http://localhost:11434` |
| `DEFAULT_MODEL_NAME` | Required default model name | _(none)_                 |
| `GATEWAY_URL`        | OrchestrAI Gateway URL      | `http://localhost:3000`  |
