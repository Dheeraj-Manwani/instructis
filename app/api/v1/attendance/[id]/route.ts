import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import * as attendanceService from "@/services/attendance.service";
import { updateAttendanceSchema } from "@/lib/schemas/attendance.schema";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const parsedParams = await params;
  const sessionId = parsedParams?.id;
  if (!sessionId) throw new ValidationError("sessionId is required");

  const detail = await attendanceService.getSessionDetailForFaculty(
    session.user.id,
    sessionId
  );

  return ApiResponse.success(detail);
});

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const parsedParams = await params;
  const sessionId = parsedParams?.id;
  if (!sessionId) throw new ValidationError("sessionId is required");

  const body = await withValidation(req, updateAttendanceSchema);

  const updated = await attendanceService.updateAttendanceForSession(
    session.user.id,
    sessionId,
    body
  );

  return ApiResponse.success(updated, "Attendance updated");
});

