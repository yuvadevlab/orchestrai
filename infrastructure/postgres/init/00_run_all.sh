#!/bin/bash
set -e

echo "==> [OrchestrAI] Initializing PostgreSQL extensions..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/init/01_extensions.sql

echo "==> [OrchestrAI] Applying schema migrations in alphabetical order..."
for file in /docker-entrypoint-initdb.d/migrations/*.sql; do
    if [ -f "$file" ]; then
        echo "==> [OrchestrAI] Executing: $(basename "$file")"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$file"
    fi
done

echo "==> [OrchestrAI] Database initialization completed successfully!"
