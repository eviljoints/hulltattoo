-- CreateTable
CREATE TABLE "TattooDesign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "artistName" TEXT NOT NULL,
    "fileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TattooDesign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TattooDesign" ADD CONSTRAINT "TattooDesign_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
