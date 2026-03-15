-- Set existing NULL role values to 'student' before making column non-nullable
UPDATE "user" SET role = 'student' WHERE role IS NULL;

-- AlterTable: set default and make role non-nullable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'student';
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;
