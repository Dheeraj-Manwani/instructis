import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { ForbiddenError } from "@/lib/utils/errors";
import {
  questionListQuerySchema,
  createQuestionBodySchema,
} from "@/lib/schemas/question.schema";
import * as questionService from "@/services/question.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const parsed = questionListQuerySchema.parse(query);

  const result = await questionService.listQuestions({
    ...parsed,
    userId: session.user.id,
    requestorRole: session.user.role ?? "STUDENT",
  });
  return ApiResponse.success(result.data, undefined, result.meta);
});

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const body = await withValidation(req, createQuestionBodySchema);
  const facultyId = await questionService.getFacultyIdForUser(session.user.id);
  if (!facultyId) {
    throw new ForbiddenError("Faculty profile not found");
  }
  const question = await questionService.createQuestion(body, facultyId);
  return ApiResponse.created(question, "Question created");
});
