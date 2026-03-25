import { NextRequest } from "next/server";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import * as assignmentService from "@/services/assignment.service";
import { gradeSubmissionSchema } from "@/lib/schemas/assignment.schema";

export const POST = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const parsedParams = await params;
  const assignmentId = parsedParams?.id;
  if (!assignmentId) throw new ValidationError("assignmentId is required");

  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) throw new ValidationError("studentId is required");

  const body = await withValidation(req, gradeSubmissionSchema);

  const graded = await assignmentService.gradeSubmissionForFaculty({
    facultyUserId: session.user.id,
    assignmentId,
    studentUserId: studentId,
    data: body,
  });

  return ApiResponse.success(graded, "Submission graded");
});

