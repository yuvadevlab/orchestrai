"""
apps/crawler/src/server.py
FastAPI server exposing Playwright browser automation, deep crawling, and RAG ingestion endpoints.
"""

from typing import Optional
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from .config import settings
from .browser import browser_manager
from .parser import parse_html_document
from .crawler import crawler
from .ingestion import ingest_page_to_rag


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes browser subprocess on startup and drains it on shutdown."""
    await browser_manager.initialize()
    yield
    await browser_manager.close()


app = FastAPI(
    title="OrchestrAI Crawler Service",
    description="Playwright browser automation, web scraping, and RAG ingestion service",
    version="0.1.0",
    lifespan=lifespan,
)


class ScrapeRequest(BaseModel):
    """Single URL scrape request."""
    url: str = Field(..., description="Target webpage URL")


class CrawlRequest(BaseModel):
    """Recursive crawl request."""
    url: str = Field(..., description="Root seed URL")
    max_depth: Optional[int] = Field(None, description="Max link depth")
    max_pages: Optional[int] = Field(None, description="Max visited pages")
    ingest_to_rag: bool = Field(default=False, description="Automatically ingest pages into RAG")
    tenant_id: Optional[str] = Field(None, description="Tenant UUID for isolation")


@app.get("/health")
@app.get("/ready")
async def health_check():
    """Health probe endpoint."""
    return {"status": "ok", "service": "orchestrai-crawler"}


@app.post("/scrape")
async def scrape_url(req: ScrapeRequest):
    """
    Scrapes a single URL, executes JavaScript via Playwright, and extracts clean Markdown.
    """
    try:
        raw_html, screenshot = await browser_manager.fetch_page_content(req.url)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch {req.url}: {str(exc)}")

    parsed = parse_html_document(raw_html, req.url)

    return {
        "url": parsed.url,
        "title": parsed.title,
        "markdown": parsed.markdown,
        "linksCount": len(parsed.links),
        "links": parsed.links,
        "metadata": parsed.metadata,
        "hasScreenshot": screenshot is not None,
    }


@app.post("/crawl")
async def crawl_site(req: CrawlRequest):
    """
    Recursively crawls a website within domain bounds and optionally ingests pages to RAG.
    """
    pages = await crawler.crawl(
        start_url=req.url,
        max_depth=req.max_depth,
        max_pages=req.max_pages,
    )

    ingestion_results = []
    if req.ingest_to_rag:
        for page in pages:
            res = await ingest_page_to_rag(page, tenant_id=req.tenant_id)
            ingestion_results.append(res)

    return {
        "seedUrl": req.url,
        "pagesVisited": len(pages),
        "pages": [
            {
                "url": p.url,
                "title": p.title,
                "lengthChars": len(p.markdown),
                "linksCount": len(p.links),
            }
            for p in pages
        ],
        "ingestion": ingestion_results if req.ingest_to_rag else None,
    }


def main():
    """Direct entry point for running the crawler daemon."""
    uvicorn.run(
        "src.server:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )


if __name__ == "__main__":
    main()
