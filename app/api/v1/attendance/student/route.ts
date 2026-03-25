import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import * as attendanceService from "@/services/attendance.service";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "STUDENT");

  const batchId = req.nextUrl.searchParams.get("batchId");
  if (!batchId) throw new ValidationError("batchId is required");

  const data = await attendanceService.getStudentAttendance(
    session.user.id,
    batchId
  );

  return ApiResponse.success(data);
});

