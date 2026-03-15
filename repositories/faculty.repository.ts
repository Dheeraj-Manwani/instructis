import prisma from "@/lib/prisma";

export async function findFacultyIdByUserId(userId: string): Promise<string | null> {
  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    select: { id: true },
  });
  return faculty?.id ?? null;
}
