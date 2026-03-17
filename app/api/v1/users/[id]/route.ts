import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import { userIdParamSchema, updateUserRoleBodySchema } from "@/lib/schemas/user.schema";
import * as userService from "@/services/user.service";
import { NextRequest } from "next/server";
import { RoleEnum } from "@prisma/client";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  const { id } = userIdParamSchema.parse(await params);

  const user = await userService.getUserById(id, {
    requestorId: session.user.id,
    requestorRole: session.user.role ?? RoleEnum.STUDENT,
  });
  return ApiResponse.success(user);
});

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { id } = userIdParamSchema.parse(await params);
  const body = await withValidation(req, updateUserRoleBodySchema);
  if (body.role == null) {
    throw new ValidationError("Role is required");
  }
  const user = await userService.updateUserRole(id, body.role);
  return ApiResponse.success(user, "User role updated");
});
