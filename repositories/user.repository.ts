import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import { RoleEnum } from "@prisma/client";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: RoleEnum;
  createdAt: Date;
  updatedAt: Date;
};

export async function findManyUsers(params: {
  page: number;
  limit: number;
}): Promise<{ users: UserListItem[]; total: number }> {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return { users, total };
}

export async function findUserById(id: string): Promise<UserListItem | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}

export async function getUserByIdOrThrow(id: string): Promise<UserListItem> {
  const user = await findUserById(id);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
}

export async function updateUserRole(
  userId: string,
  newRole: RoleEnum
): Promise<UserListItem> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
}

async function generateRollNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ROLL${year}`;

  // Find the highest roll number for this year
  const lastStudent = await prisma.student.findFirst({
    where: {
      rollNo: {
        startsWith: prefix,
      },
    },
    orderBy: {
      rollNo: "desc",
    },
  });

  if (!lastStudent) {
    return `${prefix}001`;
  }

  const lastNumber = parseInt(lastStudent.rollNo.replace(prefix, ""), 10);
  const nextNumber = lastNumber + 1;
  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

export async function createStudentRecord(userId: string) {
  const rollNo = await generateRollNo();
  await prisma.student.create({
    data: {
      userId,
      rollNo,
    },
  });
}

export async function createFacultyRecord(userId: string) {
  await prisma.faculty.create({
    data: {
      userId,
    },
  });
}

export async function deleteStudentRecord(userId: string) {
  await prisma.student.deleteMany({
    where: { userId },
  });
}

export async function deleteFacultyRecord(userId: string) {
  await prisma.faculty.deleteMany({
    where: { userId },
  });
}
