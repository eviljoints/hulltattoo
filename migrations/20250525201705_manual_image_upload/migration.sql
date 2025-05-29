/*
  Warnings:

  - You are about to drop the column `fileId` on the `TattooDesign` table. All the data in the column will be lost.
  - Added the required column `imagePath` to the `TattooDesign` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TattooDesign" DROP CONSTRAINT "TattooDesign_fileId_fkey";

-- AlterTable
ALTER TABLE "TattooDesign" DROP COLUMN "fileId",
ADD COLUMN     "imagePath" TEXT NOT NULL;
