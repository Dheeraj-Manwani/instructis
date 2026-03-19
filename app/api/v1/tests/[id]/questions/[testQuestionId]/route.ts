import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { testQuestionIdParamsSchema, updateTestQuestionBodySchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import { NextRequest } from "next/server";

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id, testQuestionId } = testQuestionIdParamsSchema.parse(await params);
    const body = await withValidation(req, updateTestQuestionBodySchema);
    const updated = await mockTestService.updateTestQuestion(id, testQuestionId, body);

    return ApiResponse.success(updated, "Test question updated");
});

export const DELETE = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id, testQuestionId } = testQuestionIdParamsSchema.parse(await params);
    await mockTestService.removeQuestionFromTest(id, testQuestionId);

    return ApiResponse.success({ id: testQuestionId }, "Question removed from test");
});
