-- CreateEnum
CREATE TYPE "CallbackStatus" AS ENUM ('PENDING', 'CALLED', 'CONVERTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "CourseMode" AS ENUM ('ONLINE', 'CLASSROOM', 'HYBRID');

-- CreateTable
CREATE TABLE "CallbackRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "courseMode" "CourseMode",
    "examType" "ExamType",
    "status" "CallbackStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),

    CONSTRAINT "CallbackRequest_pkey" PRIMARY KEY ("id")
);
