import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import * as attendanceService from "@/services/attendance.service";
import { createClassSessionSchema } from "@/lib/schemas/attendance.schema";

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const body = await withValidation(req, createClassSessionSchema);

  const sessionData = await attendanceService.createSession(
    session.user.id,
    body
  );

  return ApiResponse.created(sessionData, "Attendance session created");
});

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const batchId = req.nextUrl.searchParams.get("batchId");
  if (!batchId) throw new ValidationError("batchId is required");

  const sessions = await attendanceService.getSessionsForBatchForFaculty(
    session.user.id,
    batchId
  );

  return ApiResponse.success(sessions);
});

