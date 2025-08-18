/*
  Warnings:

  - You are about to drop the column `endMinutes` on the `AvailabilityOverride` table. All the data in the column will be lost.
  - You are about to drop the column `startMinutes` on the `AvailabilityOverride` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `basePricePence` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `durationMinutes` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `Availability` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `priceGBP` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `serviceId` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `durationMin` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceGBP` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_artistId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_serviceId_fkey";

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "calendarId" TEXT,
ADD COLUMN     "googleTokens" JSONB;

-- AlterTable
ALTER TABLE "AvailabilityOverride" DROP COLUMN "endMinutes",
DROP COLUMN "startMinutes",
ADD COLUMN     "endMin" INTEGER,
ADD COLUMN     "startMin" INTEGER;

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "totalAmount",
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "depositGBP" INTEGER,
ADD COLUMN     "priceGBP" INTEGER NOT NULL,
ALTER COLUMN "serviceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "basePricePence",
DROP COLUMN "durationMinutes",
DROP COLUMN "isActive",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bufferAfterMin" INTEGER,
ADD COLUMN     "bufferBeforeMin" INTEGER,
ADD COLUMN     "depositGBP" INTEGER,
ADD COLUMN     "depositPct" INTEGER,
ADD COLUMN     "durationMin" INTEGER NOT NULL,
ADD COLUMN     "priceGBP" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Availability";

-- CreateTable
CREATE TABLE "ServiceOnArtist" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "priceGBP" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServiceOnArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityTemplate" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/London',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOnArtist_artistId_serviceId_key" ON "ServiceOnArtist"("artistId", "serviceId");

-- CreateIndex
CREATE INDEX "AvailabilityTemplate_artistId_weekday_idx" ON "AvailabilityTemplate"("artistId", "weekday");

-- CreateIndex
CREATE INDEX "Artist_isActive_name_idx" ON "Artist"("isActive", "name");

-- AddForeignKey
ALTER TABLE "ServiceOnArtist" ADD CONSTRAINT "ServiceOnArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOnArtist" ADD CONSTRAINT "ServiceOnArtist_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityTemplate" ADD CONSTRAINT "AvailabilityTemplate_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
