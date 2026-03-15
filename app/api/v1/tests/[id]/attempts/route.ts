import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import * as mockTestService from "@/services/mock-test.service";
import { NextRequest } from "next/server";
import { z } from "zod";

const testIdParamSchema = z.object({
    id: z.string().min(1, "Test ID is required"),
});

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id } = testIdParamSchema.parse(await params);

    const attempts = await mockTestService.getTestAttempts(id);

    return ApiResponse.success(attempts);
});
