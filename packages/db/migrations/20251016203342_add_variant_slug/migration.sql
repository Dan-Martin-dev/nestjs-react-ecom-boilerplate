/*
  Warnings:

  - A unique constraint covering the columns `[name,type]` on the table `ProductAttribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProductAttribute_name_key";

-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProductAttributeGlobalValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "attributeId" TEXT NOT NULL,

    CONSTRAINT "ProductAttributeGlobalValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeValue" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "attributeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToAttribute" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductToProductAttributeGlobalValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeGlobalValue_attributeId_value_key" ON "ProductAttributeGlobalValue"("attributeId", "value");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_attributeId_idx" ON "ProductAttributeValue"("attributeId");

-- CreateIndex
CREATE INDEX "ProductAttributeValue_productId_idx" ON "ProductAttributeValue"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeValue_attributeId_productId_value_key" ON "ProductAttributeValue"("attributeId", "productId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToAttribute_AB_unique" ON "_ProductToAttribute"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToAttribute_B_index" ON "_ProductToAttribute"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductAttributeGlobalValue_AB_unique" ON "_ProductToProductAttributeGlobalValue"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductAttributeGlobalValue_B_index" ON "_ProductToProductAttributeGlobalValue"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttribute_name_type_key" ON "ProductAttribute"("name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_slug_key" ON "ProductVariant"("slug");

-- CreateIndex
CREATE INDEX "ProductVariant_slug_idx" ON "ProductVariant"("slug");

-- AddForeignKey
ALTER TABLE "ProductAttributeGlobalValue" ADD CONSTRAINT "ProductAttributeGlobalValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToAttribute" ADD CONSTRAINT "_ProductToAttribute_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToAttribute" ADD CONSTRAINT "_ProductToAttribute_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductAttribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductAttributeGlobalValue" ADD CONSTRAINT "_ProductToProductAttributeGlobalValue_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductAttributeGlobalValue" ADD CONSTRAINT "_ProductToProductAttributeGlobalValue_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductAttributeGlobalValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
