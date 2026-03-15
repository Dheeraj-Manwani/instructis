import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { ApiResponse } from "@/lib/utils/api-response";
import { userIdParamSchema } from "@/lib/validations/user.schema";
import * as userService from "@/services/user.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  const { id } = userIdParamSchema.parse(await params);

  const user = await userService.getUserById(id, {
    requestorId: session.user.id,
    requestorRole: session.user.role ?? "",
  });
  return ApiResponse.success(user);
});
