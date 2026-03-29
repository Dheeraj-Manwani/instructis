-- Add editable human-readable faculty code (e.g. AB203)
ALTER TABLE "Faculty"
ADD COLUMN "facultyCode" TEXT;

CREATE UNIQUE INDEX "Faculty_facultyCode_key" ON "Faculty"("facultyCode");
