/*
  Warnings:

  - A unique constraint covering the columns `[mockTestId,orderIndex]` on the table `MockTestQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "StudentAnswer" DROP CONSTRAINT "StudentAnswer_attemptId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "MockTestQuestion_mockTestId_orderIndex_key" ON "MockTestQuestion"("mockTestId", "orderIndex");

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
