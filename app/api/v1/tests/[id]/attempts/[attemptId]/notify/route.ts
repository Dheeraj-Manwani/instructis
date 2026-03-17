import { NextRequest } from "next/server";

import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { testAttemptIdParamsSchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";

export const POST = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id: testId, attemptId } = testAttemptIdParamsSchema.parse(await params);

    // Ensure attempt belongs to this test is enforced in service/repository via mockTestId
    const result = await mockTestService.notifyTestAttemptResult(attemptId);

    if (result.mockTestId !== testId) {
        // Basic guard to avoid notifying attempts from another test via wrong URL
        return ApiResponse.forbidden();
    }

    return ApiResponse.success(result, "Result notification sent to parent");
});

