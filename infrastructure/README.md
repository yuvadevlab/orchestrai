# Infrastructure

Local-first development environments, container definitions, and deployment configurations for OrchestrAI.

## Directory Layout

| Directory                                 | Purpose                                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`docker`](infrastructure/docker)         | Docker Compose files for local multi-service orchestration (Postgres, Redis, Ollama, Qdrant) |
| [`postgres`](infrastructure/postgres)     | Init scripts, pgvector extensions, migrations, index definitions                             |
| [`redis`](infrastructure/redis)           | Redis configuration for queues, pub/sub, caching, rate limiting                              |
| [`ollama`](infrastructure/ollama)         | Local model definitions, Modelfiles, setup scripts                                           |
| [`nginx`](infrastructure/nginx)           | Reverse proxy configuration, routing, SSL termination                                        |
| [`monitoring`](infrastructure/monitoring) | Prometheus metrics scraping configs, Grafana dashboards, Jaeger/OTel collectors              |
