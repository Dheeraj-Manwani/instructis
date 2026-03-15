import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { questionIdParamSchema, updateQuestionBodySchema } from "@/lib/schemas/question.schema";
import * as questionService from "@/services/question.service";
import { NextRequest } from "next/server";
import { RoleEnum } from "@prisma/client";
import type { Session } from "@/lib/auth";

async function getContext(session: Session) {
  let facultyId: string | undefined;
  if (session.user.role === RoleEnum.FACULTY) {
    const id = await questionService.getFacultyIdForUser(session.user.id);
    facultyId = id ?? undefined;
  }
  return {
    requestorId: session.user.id,
    requestorRole: session.user.role ?? RoleEnum.STUDENT,
    facultyId,
  };
}

export const GET = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const { id } = questionIdParamSchema.parse(await params);
  const context = await getContext(session);
  const question = await questionService.getQuestionById(id, context);
  return ApiResponse.success(question);
});

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const { id } = questionIdParamSchema.parse(await params);
  const body = await withValidation(req, updateQuestionBodySchema);
  const context = await getContext(session);
  const question = await questionService.updateQuestion(id, body, context);
  return ApiResponse.success(question, "Question updated");
});

export const DELETE = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const { id } = questionIdParamSchema.parse(await params);
  const context = await getContext(session);
  await questionService.deleteQuestion(id, context);
  return ApiResponse.success(null, "Question deleted");
});
