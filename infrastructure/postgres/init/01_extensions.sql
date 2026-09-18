-- ============================================================================
-- File: infrastructure/postgres/init/01_extensions.sql
-- Description: Core PostgreSQL extensions for OrchestrAI local-first platform.
-- Architecture: Enables UUID generation, cryptographic hashing, and vector search.
-- ============================================================================

-- 1. uuid-ossp: Generates standard RFC 4122 compliant UUIDs (v4 random, v5 namespaced)
-- Used for distributed identity generation when application does not provide an ID.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. pgcrypto: Provides cryptographic hash functions and secure random bytes.
-- Used for content hashing, idempotency validation, and token generation.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. vector: pgvector extension for high-dimensional vector embeddings.
-- Used in Phase 15 (Memory) and Phase 16 (RAG) for similarity search (e.g. 1536-dim embeddings).
CREATE EXTENSION IF NOT EXISTS "vector";
