# Infrastructure

Local-first development environments, container definitions, and deployment configurations for OrchestrAI.

## Directory Layout

| Directory                                                                                                | Purpose                                                                                      |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`docker`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/infrastructure/docker)         | Docker Compose files for local multi-service orchestration (Postgres, Redis, Ollama, Qdrant) |
| [`postgres`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/infrastructure/postgres)     | Init scripts, pgvector extensions, migrations, index definitions                             |
| [`redis`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/infrastructure/redis)           | Redis configuration for queues, pub/sub, caching, rate limiting                              |
| [`ollama`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/infrastructure/ollama)         | Local model definitions, Modelfiles, setup scripts                                           |
| [`nginx`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/infrastructure/nginx)           | Reverse proxy configuration, routing, SSL termination                                        |
| [`monitoring`](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/Repos/orchestrai/infrastructure/monitoring) | Prometheus metrics scraping configs, Grafana dashboards, Jaeger/OTel collectors              |
