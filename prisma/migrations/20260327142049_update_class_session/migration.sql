/*
  Warnings:

  - Added the required column `title` to the `ClassSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ClassSession` table without a default value. This is not possible if the table is not empty.
  - Made the column `startTime` on table `ClassSession` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endTime` on table `ClassSession` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN     "cancelNote" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "meetLink" TEXT,
ADD COLUMN     "status" "ClassStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "endTime" SET NOT NULL;
