import type { ExamType, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";

export type BatchListItem = {
  id: string;
  name: string;
  examType: ExamType;
  year: number;
  isActive: boolean;
  createdAt: Date;
};

type ListParams = {
  page: number;
  limit: number;
  examType?: ExamType;
  isActive?: boolean;
  sortBy: "createdAt" | "name" | "year";
  sortOrder: "asc" | "desc";
};

export async function findManyBatches(
  params: ListParams
): Promise<{ batches: BatchListItem[]; total: number }> {
  const { page, limit, examType, isActive, sortBy, sortOrder } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.BatchWhereInput = {};
  if (examType) where.examType = examType;
  if (typeof isActive === "boolean") where.isActive = isActive;

  const orderBy = { [sortBy]: sortOrder } as const;

  const [batches, total] = await Promise.all([
    prisma.batch.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.batch.count({ where }),
  ]);

  return {
    batches: batches.map((b) => ({
      id: b.id,
      name: b.name,
      examType: b.examType,
      year: b.year,
      isActive: b.isActive,
      createdAt: b.createdAt,
    })),
    total,
  };
}

export async function findBatchById(id: string): Promise<BatchListItem | null> {
  const batch = await prisma.batch.findUnique({
    where: { id },
  });
  return batch;
}

export async function getBatchByIdOrThrow(id: string): Promise<BatchListItem> {
  const batch = await findBatchById(id);
  if (!batch) throw new NotFoundError("Batch not found");
  return batch;
}

export async function createBatch(data: {
  name: string;
  examType: ExamType;
  year: number;
  isActive: boolean;
}): Promise<BatchListItem> {
  const batch = await prisma.batch.create({
    data,
  });
  return {
    id: batch.id,
    name: batch.name,
    examType: batch.examType,
    year: batch.year,
    isActive: batch.isActive,
    createdAt: batch.createdAt,
  };
}

export async function updateBatch(
  id: string,
  data: Partial<{ name: string; examType: ExamType; year: number; isActive: boolean }>
): Promise<BatchListItem> {
  const batch = await prisma.batch.update({
    where: { id },
    data,
  });
  return {
    id: batch.id,
    name: batch.name,
    examType: batch.examType,
    year: batch.year,
    isActive: batch.isActive,
    createdAt: batch.createdAt,
  };
}

export async function addStudentsToBatch(batchId: string, studentIds: string[]) {
  // studentIds are user IDs, need to find the student records
  const students = await prisma.student.findMany({
    where: {
      userId: { in: studentIds },
    },
    select: { id: true },
  });

  const actualStudentIds = students.map((s) => s.id);

  await prisma.student.updateMany({
    where: {
      id: { in: actualStudentIds },
    },
    data: {
      batchId,
    },
  });
}

export async function addFacultiesToBatch(batchId: string, facultyIds: string[]) {
  // facultyIds are user IDs, need to find the faculty records
  const faculties = await prisma.faculty.findMany({
    where: {
      userId: { in: facultyIds },
    },
    select: { id: true },
  });

  const actualFacultyIds = faculties.map((f) => f.id);

  await prisma.batchFaculty.createMany({
    data: actualFacultyIds.map((facultyId) => ({
      batchId,
      facultyId,
    })),
    skipDuplicates: true,
  });
}

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function findStudentsNotInBatch(
  batchId: string
): Promise<UserListItem[]> {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { examType: true },
  });

  if (!batch) throw new NotFoundError("Batch not found");

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { batchId: null },
        { batchId: { not: batchId } },
      ],
      user: {
        role: "STUDENT",
      },
      targetExam: batch.examType,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return students.map((s) => ({
    id: s.user.id,
    name: s.user.name,
    email: s.user.email,
    role: s.user.role,
  }));
}

export async function findFacultiesNotInBatch(
  batchId: string
): Promise<UserListItem[]> {
  const facultiesInBatch = await prisma.batchFaculty.findMany({
    where: { batchId },
    select: { facultyId: true },
  });

  const facultyIdsInBatch = facultiesInBatch.map((bf) => bf.facultyId);

  const faculties = await prisma.faculty.findMany({
    where: {
      id: { notIn: facultyIdsInBatch },
      user: {
        role: "FACULTY",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return faculties.map((f) => ({
    id: f.user.id,
    name: f.user.name,
    email: f.user.email,
    role: f.user.role,
  }));
}

export async function findBatchesForFaculty(
  facultyUserId: string
): Promise<BatchListItem[]> {
  const faculty = await prisma.faculty.findUnique({
    where: { userId: facultyUserId },
    select: { id: true },
  });

  if (!faculty) {
    return [];
  }

  const batchFaculties = await prisma.batchFaculty.findMany({
    where: { facultyId: faculty.id },
    include: {
      batch: true,
    },
    orderBy: {
      batch: {
        createdAt: "desc",
      },
    },
  });

  return batchFaculties.map((bf) => ({
    id: bf.batch.id,
    name: bf.batch.name,
    examType: bf.batch.examType,
    year: bf.batch.year,
    isActive: bf.batch.isActive,
    createdAt: bf.batch.createdAt,
  }));
}

export type StudentInBatch = {
  id: string;
  rollNo: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export async function findStudentsInBatch(batchId: string): Promise<StudentInBatch[]> {
  const students = await prisma.student.findMany({
    where: { batchId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      rollNo: "asc",
    },
  });

  return students.map((s) => ({
    id: s.id,
    rollNo: s.rollNo,
    user: s.user,
  }));
}

export type FacultyInBatch = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export async function findFacultiesInBatch(
  batchId: string
): Promise<FacultyInBatch[]> {
  const faculties = await prisma.faculty.findMany({
    where: {
      batches: {
        some: { batchId },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
  });

  return faculties.map((f) => ({
    id: f.id,
    user: {
      id: f.user.id,
      name: f.user.name,
      email: f.user.email,
    },
  }));
}

export async function deleteBatchByIdCascade(batchId: string): Promise<void> {
  const existing = await prisma.batch.findUnique({
    where: { id: batchId },
    select: { id: true },
  });

  if (!existing) throw new NotFoundError("Batch not found");

  // Note: avoid an interactive transaction here because a batch can have many related rows.
  // Running ordered statements keeps referential integrity while preventing `tx` invalidation (P2028).

  // Detach students and marks from the batch first to avoid FK issues.
  await prisma.student.updateMany({
    where: { batchId },
    data: { batchId: null },
  });

  await prisma.mark.updateMany({
    where: { batchId },
    data: { batchId: null },
  });

  // Delete dependent rows under mock tests for this batch.
  await prisma.studentAnswer.deleteMany({
    where: {
      attempt: {
        mockTest: { batchId },
      },
    },
  });

  await prisma.testAttempt.deleteMany({
    where: {
      mockTest: { batchId },
    },
  });

  await prisma.mockTestQuestion.deleteMany({
    where: {
      mockTest: { batchId },
    },
  });

  await prisma.mockTest.deleteMany({
    where: { batchId },
  });

  // Detach faculties from the batch.
  await prisma.batchFaculty.deleteMany({
    where: { batchId },
  });

  // Finally delete the batch itself.
  await prisma.batch.delete({
    where: { id: batchId },
  });
}
