import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";

export async function getStudentByUserIdOrThrow(userId: string): Promise<{
  id: string;
  batchId: string | null;
}> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true, batchId: true },
  });

  if (!student) {
    throw new NotFoundError("Student profile not found");
  }

  return { id: student.id, batchId: student.batchId };
}

