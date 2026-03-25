import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import * as assignmentService from "@/services/assignment.service";
import { createAssignmentSchema } from "@/lib/schemas/assignment.schema";
import { RoleEnum } from "@prisma/client";

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const body = await withValidation(req, createAssignmentSchema);

  const created = await assignmentService.createAssignment(
    session.user.id,
    body
  );

  return ApiResponse.created(created, "Assignment created");
});

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "STUDENT");

  const batchId = req.nextUrl.searchParams.get("batchId");

  if (session.user.role === RoleEnum.FACULTY) {
    const assignments = await assignmentService.listForFaculty(session.user.id);
    return ApiResponse.success(assignments);
  }

  if (session.user.role === RoleEnum.STUDENT) {
    if (!batchId) throw new ValidationError("batchId is required");
    const assignments = await assignmentService.listForStudent(session.user.id, batchId);
    return ApiResponse.success(assignments);
  }

  throw new ValidationError("Unsupported role");
});

