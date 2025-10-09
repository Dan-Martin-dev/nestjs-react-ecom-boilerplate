-- CreateEnum
CREATE TYPE "ImageFormat" AS ENUM ('JPEG', 'PNG', 'SVG', 'WEBP', 'GIF');

-- CreateEnum
CREATE TYPE "ImageUsage" AS ENUM ('THUMBNAIL', 'GALLERY', 'PRINT', 'WEB', 'MOBILE');

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "format" "ImageFormat" NOT NULL DEFAULT 'JPEG',
ADD COLUMN     "isVector" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "printResolution" INTEGER,
ADD COLUMN     "usage" "ImageUsage"[];
