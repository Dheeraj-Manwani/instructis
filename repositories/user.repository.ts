import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
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
