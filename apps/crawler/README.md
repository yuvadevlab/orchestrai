# OrchestrAI Crawler & RAG Ingestion Service

Playwright browser automation, deep web crawler, and automated RAG document ingestion sidecar for OrchestrAI.

## Features

- **Headless Browser Execution**: Uses Playwright Chromium with anti-bot user-agents and JavaScript rendering.
- **Resilient Fallback**: Automatically falls back to high-concurrency HTTP fetch if browser binaries are unavailable.
- **Smart DOM Extraction**: Removes noise (nav, scripts, ads), extracts metadata, and translates pages into clean Markdown.
- **RAG Auto-Ingestion**: Splits web documents into semantic chunks with overlap and posts them directly into the OrchestrAI Gateway RAG knowledge base.

## Endpoints

- `GET /health`: Health probe.
- `POST /scrape`: Single URL scrape and markdown extraction.
- `POST /crawl`: Recursive breadth-first domain crawler with optional RAG chunk ingestion (`ingest_to_rag: true`).

## Running Locally

```bash
# Create local virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Launch service
python -m src.server
```
