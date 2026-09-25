-- CreateEnum
CREATE TYPE "PlatformScope" AS ENUM ('PLATFORM', 'TENANT');

-- CreateTable
CREATE TABLE "llm_providers" (
    "provider_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "provider_type" VARCHAR(64) NOT NULL,
    "description" VARCHAR(500),
    "base_url" VARCHAR(512),
    "config" JSONB NOT NULL DEFAULT '{}',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "scope" "PlatformScope" NOT NULL DEFAULT 'PLATFORM',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(128),

    CONSTRAINT "llm_providers_pkey" PRIMARY KEY ("provider_id")
);

-- CreateTable
CREATE TABLE "llm_models" (
    "model_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "model_identifier" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "capabilities" JSONB NOT NULL DEFAULT '{}',
    "default_config" JSONB NOT NULL DEFAULT '{}',
    "context_window" INTEGER NOT NULL DEFAULT 8192,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "scope" "PlatformScope" NOT NULL DEFAULT 'PLATFORM',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(128),

    CONSTRAINT "llm_models_pkey" PRIMARY KEY ("model_id")
);

-- CreateTable
CREATE TABLE "platform_modes" (
    "mode_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(32) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "icon" VARCHAR(64),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "enforce_approval" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_modes_pkey" PRIMARY KEY ("mode_id")
);

-- CreateTable
CREATE TABLE "nav_items" (
    "nav_item_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" VARCHAR(80) NOT NULL,
    "icon" VARCHAR(64),
    "href" VARCHAR(255) NOT NULL,
    "roles" JSONB NOT NULL DEFAULT '[]',
    "section" VARCHAR(32) NOT NULL DEFAULT 'main',
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nav_items_pkey" PRIMARY KEY ("nav_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "llm_providers_slug_key" ON "llm_providers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "uq_provider_model_identifier" ON "llm_models"("provider_id", "model_identifier");

-- CreateIndex
CREATE UNIQUE INDEX "platform_modes_slug_key" ON "platform_modes"("slug");

-- AddForeignKey
ALTER TABLE "llm_models" ADD CONSTRAINT "llm_models_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "llm_providers"("provider_id") ON DELETE CASCADE ON UPDATE CASCADE;
