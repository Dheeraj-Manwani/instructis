import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import { RoleEnum } from "@prisma/client";

export type FacultyListItem = {
  id: string;
  facultyCode: string | null;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  department: string | null;
  title: string | null;
  batchesCount: number;
  questionsCount: number;
  joinedAt: Date;
};

export async function findManyFaculties(params: {
  page: number;
  limit: number;
  search?: string;
  department?: string;
}): Promise<{ faculties: FacultyListItem[]; total: number }> {
  const { page, limit, search, department } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(department
      ? { department: { equals: department, mode: "insensitive" as const } }
      : {}),
    user: {
      role: RoleEnum.FACULTY,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
  };

  const [records, total] = await Promise.all([
    prisma.faculty.findMany({
      where,
      skip,
      take: limit,
      orderBy: { user: { createdAt: "desc" } },
      select: {
        id: true,
        facultyCode: true,
        userId: true,
        department: true,
        title: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            batches: true,
            questions: true,
          },
        },
      },
    }),
    prisma.faculty.count({ where }),
  ]);

  return {
    faculties: records.map((record) => ({
      id: record.id,
      facultyCode: record.facultyCode,
      userId: record.userId,
      name: record.user.name,
      email: record.user.email,
      image: record.user.image,
      department: record.department,
      title: record.title,
      batchesCount: record._count.batches,
      questionsCount: record._count.questions,
      joinedAt: record.user.createdAt,
    })),
    total,
  };
}

export async function findDistinctFacultyDepartments(): Promise<string[]> {
  const rows = await prisma.faculty.findMany({
    where: {
      department: {
        not: null,
      },
    },
    select: {
      department: true,
    },
    distinct: ["department"],
    orderBy: {
      department: "asc",
    },
  });

  return rows
    .map((row) => row.department)
    .filter((department): department is string => Boolean(department?.trim()));
}

export async function createFacultyWithCredentialAccount(data: {
  userId: string;
  facultyCode: string;
  name: string;
  email: string;
  passwordHash: string;
  title?: string | null;
  department?: string | null;
}) {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: data.userId,
        name: data.name,
        email: data.email,
        emailVerified: false,
        role: RoleEnum.FACULTY,
        createdAt: now,
        updatedAt: now,
      },
    });

    const faculty = await tx.faculty.create({
      data: {
        facultyCode: data.facultyCode,
        userId: user.id,
        title: data.title ?? null,
        department: data.department ?? null,
      },
    });

    await tx.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: data.passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    });

    return { user, faculty };
  });
}

export async function findFacultyWithUserOrThrow(facultyId: string) {
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
    include: {
      user: true,
    },
  });

  if (!faculty) {
    throw new NotFoundError("Faculty not found");
  }

  return faculty;
}

export async function updateFacultyAndUser(data: {
  facultyId: string;
  userId: string;
  facultyCode?: string;
  name?: string;
  email?: string;
  title?: string | null;
  department?: string | null;
}) {
  const updated = await prisma.faculty.update({
    where: { id: data.facultyId },
    data: {
      ...(data.facultyCode !== undefined ? { facultyCode: data.facultyCode } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.department !== undefined ? { department: data.department } : {}),
      user: {
        update: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
        },
      },
    },
    select: {
      id: true,
      facultyCode: true,
      userId: true,
      title: true,
      department: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          batches: true,
          questions: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    facultyCode: updated.facultyCode,
    userId: updated.userId,
    name: updated.user.name,
    email: updated.user.email,
    image: updated.user.image,
    department: updated.department,
    title: updated.title,
    batchesCount: updated._count.batches,
    questionsCount: updated._count.questions,
    joinedAt: updated.user.createdAt,
  } satisfies FacultyListItem;
}

export async function findFacultyByCode(facultyCode: string) {
  return prisma.faculty.findUnique({
    where: { facultyCode },
    select: { id: true },
  });
}

export async function upsertCredentialPassword(userId: string, passwordHash: string) {
  const existing = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "credential",
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    await prisma.account.update({
      where: { id: existing.id },
      data: {
        password: passwordHash,
        updatedAt: new Date(),
      },
    });
    return;
  }

  const now = new Date();
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    },
  });
}

export async function setUserRoleToUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { role: RoleEnum.USER },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
}
