"""
apps/crawler/src/config.py
Configuration settings for the Playwright crawler and RAG ingestion service.
"""

import os
from pydantic_settings import BaseSettings
from pydantic import Field


class CrawlerSettings(BaseSettings):
    """
    Runtime settings for headless browser automation and web crawling.
    """

    host: str = Field(default="0.0.0.0", description="Server bind host")
    port: int = Field(default=8083, description="Server listen HTTP port")
    headless: bool = Field(default=True, description="Run browser in headless mode")
    timeout_ms: int = Field(
        default=30000, description="Page navigation timeout in milliseconds"
    )
    max_crawl_depth: int = Field(
        default=3, description="Maximum link crawl traversal depth"
    )
    max_pages_per_crawl: int = Field(
        default=25, description="Maximum total pages per crawl request"
    )
    gateway_url: str = Field(
        default_factory=lambda: os.getenv("GATEWAY_URL", "http://localhost:3000"),
        description="Upstream OrchestrAI Gateway URL for RAG ingestion",
    )
    rag_ingest_path: str = Field(
        default_factory=lambda: os.getenv("RAG_INGEST_PATH", "/rag/documents"),
        description="Gateway endpoint path for storing document embeddings",
    )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = CrawlerSettings()
