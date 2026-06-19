-- CreateEnum
CREATE TYPE "Category" AS ENUM ('VIDEO', 'AUDIO', 'DOCUMENT', 'PICTURE');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('FILE', 'YOUTUBE');

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "category" "Category" NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "fileKey" TEXT,
    "youtubeUrl" TEXT,
    "mimeType" TEXT,
    "fileSizeBytes" INTEGER,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "pinnedOrder" INTEGER,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE INDEX "Resource_isPinned_pinnedOrder_idx" ON "Resource"("isPinned", "pinnedOrder");

-- CreateIndex
CREATE INDEX "Resource_createdAt_idx" ON "Resource"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- Full-text search: add column, GIN index, and auto-update trigger
ALTER TABLE "Resource" ADD COLUMN "search_vector" tsvector;

CREATE INDEX resource_search_idx ON "Resource" USING GIN ("search_vector");

CREATE OR REPLACE FUNCTION resource_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER resource_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Resource"
FOR EACH ROW EXECUTE FUNCTION resource_search_vector_update();
