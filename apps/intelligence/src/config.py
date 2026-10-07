"""
apps/intelligence/src/config.py
Configuration settings for the LangGraph intelligence runtime.
Enforces zero hardcoded models by requiring environment or request-level definitions.
"""

import os
from pydantic_settings import BaseSettings
from pydantic import Field


class IntelligenceSettings(BaseSettings):
    """
    Runtime settings for the intelligence service.
    Loads values from environment variables with safe, non-hardcoded defaults.
    """

    host: str = Field(default="0.0.0.0", description="Server bind host")
    port: int = Field(default=8082, description="Server listen HTTP port")
    ollama_host: str = Field(
        default_factory=lambda: os.getenv("OLLAMA_HOST", "http://localhost:11434"),
        description="Ollama daemon HTTP URL",
    )
    default_model_name: str = Field(
        default_factory=lambda: os.getenv("DEFAULT_MODEL_NAME", ""),
        description="Default fallback model name if not specified in request",
    )
    max_recursion_limit: int = Field(
        default=25,
        description="Maximum node transitions allowed before forcing termination",
    )
    context_compaction_threshold: float = Field(
        default=0.75,
        description="Context utilization fraction at which to trigger compaction",
    )
    gateway_url: str = Field(
        default_factory=lambda: os.getenv("GATEWAY_URL", "http://localhost:3000"),
        description="Upstream OrchestrAI gateway HTTP URL",
    )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = IntelligenceSettings()
