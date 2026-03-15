import { z } from "zod";
import { RoleEnum } from "@prisma/client";

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export const updateUserRoleBodySchema = z.object({
  role: z.nativeEnum(RoleEnum).nullable(),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UpdateUserRoleBody = z.infer<typeof updateUserRoleBodySchema>;