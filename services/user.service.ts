import { ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import * as userRepository from "@/repositories/user.repository";
import type { PaginationMeta } from "@/types";
import { RoleEnum } from "@prisma/client";

export type Profile = userRepository.Profile;

export type ListUsersResult = {
  data: userRepository.UserListItem[];
  meta: PaginationMeta;
};

export async function listUsers(page: number, limit: number): Promise<ListUsersResult> {
  const { users, total } = await userRepository.findManyUsers({ page, limit });
  const totalPages = Math.ceil(total / limit);
  return {
    data: users,
    meta: { total, page, limit, totalPages },
  };
}

export async function getUserById(
  id: string,
  context: { requestorId: string; requestorRole: RoleEnum | string }
) {
  const isSelf = context.requestorId === id;
  const isAdmin = context.requestorRole === "ADMIN" || context.requestorRole === RoleEnum.ADMIN;
  if (!isSelf && !isAdmin) {
    throw new ForbiddenError("You can only view your own profile");
  }
  return userRepository.getUserByIdOrThrow(id);
}

export async function updateUserRole(
  userId: string,
  newRole: RoleEnum
) {
  // Get current user to check existing role
  const currentUser = await userRepository.getUserByIdOrThrow(userId);
  const oldRole = currentUser.role;

  // If role is not changing, do nothing
  if (oldRole === newRole) {
    return currentUser;
  }

  // Delete old role records (only if they were STUDENT or FACULTY)
  if (oldRole === RoleEnum.STUDENT) {
    await userRepository.deleteStudentRecord(userId);
  } else if (oldRole === RoleEnum.FACULTY) {
    await userRepository.deleteFacultyRecord(userId);
  }

  // Update user role
  const updatedUser = await userRepository.updateUserRole(userId, newRole);

  // Create new role records (only for STUDENT or FACULTY, not for USER or ADMIN)
  if (newRole === RoleEnum.STUDENT) {
    await userRepository.createStudentRecord(userId);
  } else if (newRole === RoleEnum.FACULTY) {
    await userRepository.createFacultyRecord(userId);
  }
  // USER and ADMIN roles don't need additional records

  return updatedUser;
}

export async function getProfile(userId: string): Promise<Profile> {
  const profile = await userRepository.findProfileByUserId(userId);
  if (!profile) {
    throw new NotFoundError("Profile not found");
  }
  return profile;
}

export type UpdateProfileInput = {
  name?: string;
  image?: string | null;
  student?: {
    rollNo?: string;
    targetExam?: "JEE" | "NEET";
    batchId?: string | null;
    parentName?: string | null;
    parentPhone?: string | null;
    parentEmail?: string | null;
    address?: string | null;
    dob?: string | null;
  };
  faculty?: {
    title?: string | null;
    department?: string | null;
  };
};

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
  const user = await userRepository.getUserByIdOrThrow(userId);
  const role = user.role;

  if (input.name != null || input.image !== undefined) {
    await userRepository.updateUserProfile(userId, {
      name: input.name,
      image: input.image,
    });
  }

  if (role === RoleEnum.STUDENT && input.student) {
    const dob = input.student.dob != null && input.student.dob !== "" ? new Date(input.student.dob) : null;
    await userRepository.updateStudentByUserId(userId, {
      rollNo: input.student.rollNo,
      targetExam: input.student.targetExam as "JEE" | "NEET" | undefined,
      batchId: input.student.batchId,
      parentName: input.student.parentName,
      parentPhone: input.student.parentPhone,
      parentEmail: input.student.parentEmail,
      address: input.student.address,
      dob,
    });
  }

  if (role === RoleEnum.FACULTY && input.faculty) {
    await userRepository.updateFacultyByUserId(userId, {
      title: input.faculty.title,
      department: input.faculty.department,
    });
  }

  const updated = await userRepository.findProfileByUserId(userId);
  if (!updated) throw new NotFoundError("Profile not found");
  return updated;
}
