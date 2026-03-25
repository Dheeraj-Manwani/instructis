import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import * as assignmentService from "@/services/assignment.service";
import { submitAssignmentSchema } from "@/lib/schemas/assignment.schema";

export const POST = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "STUDENT");

  const parsedParams = await params;
  const assignmentId = parsedParams?.id;
  if (!assignmentId) throw new ValidationError("assignmentId is required");

  const body = await withValidation(req, submitAssignmentSchema);

  const submission = await assignmentService.submitForStudent(
    session.user.id,
    assignmentId,
    body
  );

  return ApiResponse.created(submission, "Assignment submitted");
});

