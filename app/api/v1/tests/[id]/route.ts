import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { createMockTestBodySchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import { NextRequest } from "next/server";
import { z } from "zod";

const testIdParamSchema = z.object({
    id: z.string().min(1, "Test ID is required"),
});

const updateMockTestBodySchema = createMockTestBodySchema.partial();

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id } = testIdParamSchema.parse(await params);

    const test = await mockTestService.getTestById(id);

    return ApiResponse.success(test);
});

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id } = testIdParamSchema.parse(await params);
    const body = await withValidation(req, updateMockTestBodySchema);

    const test = await mockTestService.updateMockTest(id, {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
    });

    return ApiResponse.success(test, "Test updated");
});
