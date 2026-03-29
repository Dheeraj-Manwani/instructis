import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { studentClassListQuerySchema } from "@/lib/schemas/class.schema";
import * as classService from "@/services/class.service";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "STUDENT");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const parsedQuery = studentClassListQuerySchema.parse(query);
  const data = await classService.listForStudent(session.user.id, parsedQuery);

  return ApiResponse.success(data);
});
