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
  const prefix = `${year}`;

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

// Profile: user + optional student/faculty
export type ProfileStudent = {
  id: string;
  userId: string;
  rollNo: string;
  targetExam: "JEE" | "NEET";
  batchId: string | null;
  batchName: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  address: string | null;
  dob: Date | null;
};

export type ProfileFaculty = {
  id: string;
  userId: string;
  title: string | null;
  department: string | null;
};

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: RoleEnum;
  createdAt: Date;
  updatedAt: Date;
};

export type Profile = {
  user: ProfileUser;
  student: ProfileStudent | null;
  faculty: ProfileFaculty | null;
};

export async function findProfileByUserId(userId: string): Promise<Profile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      student: {
        select: {
          id: true,
          userId: true,
          rollNo: true,
          targetExam: true,
          batchId: true,
          parentName: true,
          parentPhone: true,
          parentEmail: true,
          address: true,
          dob: true,
          batch: { select: { name: true } },
        },
      },
      faculty: {
        select: {
          id: true,
          userId: true,
          title: true,
          department: true,
        },
      },
    },
  });
  if (!user) return null;
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    student: user.student
      ? {
          id: user.student.id,
          userId: user.student.userId,
          rollNo: user.student.rollNo,
          targetExam: user.student.targetExam,
          batchId: user.student.batchId,
          batchName: user.student.batch?.name ?? null,
          parentName: user.student.parentName,
          parentPhone: user.student.parentPhone,
          parentEmail: user.student.parentEmail,
          address: user.student.address,
          dob: user.student.dob,
        }
      : null,
    faculty: user.faculty ?? null,
  };
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; image?: string | null }
): Promise<ProfileUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...(data.name != null && { name: data.name }), ...(data.image !== undefined && { image: data.image }) },
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

export async function updateStudentByUserId(
  userId: string,
  data: {
    rollNo?: string;
    targetExam?: "JEE" | "NEET";
    batchId?: string | null;
    parentName?: string | null;
    parentPhone?: string | null;
    parentEmail?: string | null;
    address?: string | null;
    dob?: Date | null;
  }
): Promise<ProfileStudent> {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new NotFoundError("Student record not found");
  const updated = await prisma.student.update({
    where: { id: student.id },
    data: {
      ...(data.rollNo != null && { rollNo: data.rollNo }),
      ...(data.targetExam != null && { targetExam: data.targetExam }),
      ...(data.batchId !== undefined && { batchId: data.batchId }),
      ...(data.parentName !== undefined && { parentName: data.parentName }),
      ...(data.parentPhone !== undefined && { parentPhone: data.parentPhone }),
      ...(data.parentEmail !== undefined && { parentEmail: data.parentEmail }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.dob !== undefined && { dob: data.dob }),
    },
    select: {
      id: true,
      userId: true,
      rollNo: true,
      targetExam: true,
      batchId: true,
      parentName: true,
      parentPhone: true,
      parentEmail: true,
      address: true,
      dob: true,
      batch: { select: { name: true } },
    },
  });
  return {
    ...updated,
    batchName: updated.batch?.name ?? null,
  };
}

export async function updateFacultyByUserId(
  userId: string,
  data: { title?: string | null; department?: string | null }
): Promise<ProfileFaculty> {
  const faculty = await prisma.faculty.findUnique({ where: { userId } });
  if (!faculty) throw new NotFoundError("Faculty record not found");
  const updated = await prisma.faculty.update({
    where: { id: faculty.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.department !== undefined && { department: data.department }),
    },
    select: {
      id: true,
      userId: true,
      title: true,
      department: true,
    },
  });
  return updated;
}
