/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ProductAttributeGlobalValue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ProductAttributeValue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ProductAttributeGlobalValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ProductAttributeValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add slug columns as nullable first
ALTER TABLE "ProductAttributeGlobalValue" ADD COLUMN "slug" TEXT;

ALTER TABLE "ProductAttributeValue" ADD COLUMN "slug" TEXT;

-- Backfill slugs for existing rows.
-- We generate a URL-friendly slug from the `value` and append a short id fragment to guarantee uniqueness.
UPDATE "ProductAttributeGlobalValue"
SET "slug" = lower(regexp_replace(value, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || left(id, 8)
WHERE "slug" IS NULL;

UPDATE "ProductAttributeValue"
SET "slug" = lower(regexp_replace(value, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || left(id, 8)
WHERE "slug" IS NULL;

-- Make the slug columns NOT NULL now that they've been backfilled
ALTER TABLE "ProductAttributeGlobalValue" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "ProductAttributeValue" ALTER COLUMN "slug" SET NOT NULL;

-- Create unique indexes on slug
CREATE UNIQUE INDEX "ProductAttributeGlobalValue_slug_key" ON "ProductAttributeGlobalValue"("slug");
CREATE UNIQUE INDEX "ProductAttributeValue_slug_key" ON "ProductAttributeValue"("slug");
