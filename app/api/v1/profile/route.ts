import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { updateProfileBodySchema } from "@/lib/schemas/profile.schema";
import * as userService from "@/services/user.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  const profile = await userService.getProfile(session.user.id);
  return ApiResponse.success(profile);
});

export const PATCH = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  const body = await withValidation(req, updateProfileBodySchema);
  const profile = await userService.updateProfile(session.user.id, {
    name: body.name,
    image: body.image,
    student: body.student,
    faculty: body.faculty,
  });
  return ApiResponse.success(profile, "Profile updated");
});
