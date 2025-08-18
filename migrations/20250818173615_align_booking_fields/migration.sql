/*
  Warnings:

  - You are about to drop the column `depositGBP` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `priceGBP` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `totalAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "depositGBP",
DROP COLUMN "priceGBP",
ADD COLUMN     "depositAmount" INTEGER,
ADD COLUMN     "totalAmount" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TattooDesign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "artistName" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "description" TEXT,
    "pageNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TattooDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TattooDesign_pageNumber_key" ON "TattooDesign"("pageNumber");
