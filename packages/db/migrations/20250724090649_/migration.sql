/*
  Warnings:

  - You are about to drop the column `state` on the `Address` table. All the data in the column will be lost.
  - The primary key for the `_CategoryToDiscount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_CategoryToProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_DiscountProducts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_CategoryToDiscount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_CategoryToProduct` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_DiscountProducts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `ProductAttribute` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProductAttributeType" AS ENUM ('COLOR', 'SIZE', 'MATERIAL', 'SEASON', 'GENDER', 'STYLE', 'FIT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'MERCADO_PAGO';
ALTER TYPE "PaymentMethod" ADD VALUE 'RAPIPAGO';
ALTER TYPE "PaymentMethod" ADD VALUE 'PAGO_FACIL';
ALTER TYPE "PaymentMethod" ADD VALUE 'BANK_DEBIT';

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "state",
ADD COLUMN     "apartment" TEXT,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "streetNumber" TEXT;

-- AlterTable
ALTER TABLE "ProductAttribute" DROP COLUMN "type",
ADD COLUMN     "type" "ProductAttributeType" NOT NULL;

-- AlterTable
ALTER TABLE "_CategoryToDiscount" DROP CONSTRAINT "_CategoryToDiscount_AB_pkey";

-- AlterTable
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_AB_pkey";

-- AlterTable
ALTER TABLE "_DiscountProducts" DROP CONSTRAINT "_DiscountProducts_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToDiscount_AB_unique" ON "_CategoryToDiscount"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountProducts_AB_unique" ON "_DiscountProducts"("A", "B");
