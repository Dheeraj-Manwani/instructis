import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import * as assignmentService from "@/services/assignment.service";
import { updateAssignmentSchema } from "@/lib/schemas/assignment.schema";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const parsedParams = await params;
  const assignmentId = parsedParams?.id;
  if (!assignmentId) throw new ValidationError("assignmentId is required");

  const assignment = await assignmentService.getDetailForFaculty(
    session.user.id,
    assignmentId
  );
  return ApiResponse.success(assignment);
});

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const parsedParams = await params;
  const assignmentId = parsedParams?.id;
  if (!assignmentId) throw new ValidationError("assignmentId is required");

  const body = await withValidation(req, updateAssignmentSchema);

  const updated = await assignmentService.updateForFaculty(
    session.user.id,
    assignmentId,
    body
  );

  return ApiResponse.success(updated, "Assignment updated");
});

export const DELETE = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const parsedParams = await params;
  const assignmentId = parsedParams?.id;
  if (!assignmentId) throw new ValidationError("assignmentId is required");

  await assignmentService.deleteForFaculty(session.user.id, assignmentId);
  return ApiResponse.success(null, "Assignment deleted");
});

