import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { reorderTestQuestionsBodySchema, testIdParamSchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import { NextRequest } from "next/server";

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id } = testIdParamSchema.parse(await params);
    const body = await withValidation(req, reorderTestQuestionsBodySchema);

    const updated = await mockTestService.reorderTestQuestions(id, body.items);
    return ApiResponse.success(updated, "Test question order updated");
});

