-- 1) Add pageNumber as NULLABLE
ALTER TABLE "TattooDesign" ADD COLUMN "pageNumber" INTEGER;

-- 2) Backfill existing rows with a sequential page number, ordered by id
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "TattooDesign"
)
UPDATE "TattooDesign" AS td
SET "pageNumber" = numbered.rn
FROM numbered
WHERE td.id = numbered.id;

-- 3) Make pageNumber NOT NULL
ALTER TABLE "TattooDesign"
ALTER COLUMN "pageNumber" SET NOT NULL;

-- 4) Add a UNIQUE constraint on pageNumber
ALTER TABLE "TattooDesign"
ADD CONSTRAINT "TattooDesign_pageNumber_key" UNIQUE ("pageNumber");
