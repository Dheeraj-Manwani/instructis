/*
  Warnings:

  - A unique constraint covering the columns `[studentId,topicId]` on the table `WeakArea` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TestAttempt" DROP CONSTRAINT "TestAttempt_mockTestId_fkey";

-- AlterTable
ALTER TABLE "TestAttempt" ADD COLUMN     "isPracticeAttempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "practiceTopicId" TEXT,
ALTER COLUMN "mockTestId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WeakArea_studentId_topicId_key" ON "WeakArea"("studentId", "topicId");

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
