import { ForbiddenError } from "@/lib/utils/errors";
import * as userRepository from "@/repositories/user.repository";
import type { PaginationMeta } from "@/types";

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
  context: { requestorId: string; requestorRole: string }
) {
  const isSelf = context.requestorId === id;
  const isAdmin = context.requestorRole?.toUpperCase() === "ADMIN";
  if (!isSelf && !isAdmin) {
    throw new ForbiddenError("You can only view your own profile");
  }
  return userRepository.getUserByIdOrThrow(id);
}
