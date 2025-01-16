/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appleId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "appleId" TEXT,
ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_googleId_key" ON "Client"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_appleId_key" ON "Client"("appleId");
