import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { paginationQuerySchema } from "@/lib/schemas/common.schema";
import * as userService from "@/services/user.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const { page, limit } = paginationQuerySchema.parse(query);

  const result = await userService.listUsers(page, limit);
  return ApiResponse.success(result.data, undefined, result.meta);
});
