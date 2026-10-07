"""
apps/crawler/src/ingestion.py
Document chunking and automated RAG ingestion client for the OrchestrAI knowledge base.
"""

from typing import Any
import httpx
from .parser import ParsedPage
from .config import settings


def chunk_markdown_text(
    text: str,
    chunk_size: int = 1200,
    overlap: int = 150,
) -> list[str]:
    """
    Splits long Markdown documents into overlapping chunks on semantic boundaries.

    Args:
        text: Raw Markdown document string.
        chunk_size: Target characters per chunk.
        overlap: Character overlap between consecutive chunks.

    Returns:
        List of discrete text chunks.
    """
    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    chunks: list[str] = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        # Break cleanly on newline or sentence boundary if possible
        if end < len(text):
            last_break = max(chunk.rfind("\n\n"), chunk.rfind(". "), chunk.rfind("\n"))
            if last_break > chunk_size // 2:
                chunk = chunk[: last_break + 1]
                start += last_break + 1
            else:
                start += chunk_size - overlap
        else:
            start = end

        cleaned = chunk.strip()
        if cleaned:
            chunks.append(cleaned)

    return chunks


async def ingest_page_to_rag(
    page: ParsedPage,
    tenant_id: str | None = None,
) -> dict[str, Any]:
    """
    Chunks a parsed document and registers each chunk with the OrchestrAI Gateway RAG engine.

    Args:
        page: Parsed web page document.
        tenant_id: Optional tenant UUID for multi-tenant data isolation.

    Returns:
        Ingestion outcome summary including created chunk count.
    """
    chunks = chunk_markdown_text(page.markdown)
    if not chunks:
        return {"status": "skipped", "chunksCount": 0}

    headers = {"Content-Type": "application/json"}
    if tenant_id:
        headers["x-tenant-id"] = tenant_id

    endpoint = f"{settings.gateway_url}{settings.rag_ingest_path}"
    successful_chunks = 0

    async with httpx.AsyncClient(timeout=60.0) as client:
        for idx, chunk in enumerate(chunks):
            payload = {
                "title": f"{page.title} (Part {idx + 1})",
                "content": chunk,
                "metadata": {
                    "sourceUrl": page.url,
                    "chunkIndex": idx,
                    "totalChunks": len(chunks),
                    **page.metadata,
                },
            }
            try:
                resp = await client.post(endpoint, headers=headers, json=payload)
                if resp.status_code in (200, 201):
                    successful_chunks += 1
            except Exception:
                # Continue uploading subsequent chunks on isolated chunk network failures
                continue

    return {
        "status": "ingested",
        "url": page.url,
        "title": page.title,
        "chunksCount": successful_chunks,
        "totalChunks": len(chunks),
    }
