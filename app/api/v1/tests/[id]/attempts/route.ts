import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { testIdParamSchema, createTestAttemptBodySchema, deleteTestAttemptsBodySchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id } = testIdParamSchema.parse(await params);

    const attempts = await mockTestService.getTestAttempts(id);

    return ApiResponse.success(attempts);
});

export const POST = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id } = testIdParamSchema.parse(await params);
    const body = await withValidation(req, createTestAttemptBodySchema);

    const attempt = await mockTestService.createOrUpdateTestAttempt({
        studentId: body.studentId,
        mockTestId: id,
        physicsMarks: body.physicsMarks ?? null,
        chemistryMarks: body.chemistryMarks ?? null,
        mathematicsMarks: body.mathematicsMarks ?? null,
        zoologyMarks: body.zoologyMarks ?? null,
        botanyMarks: body.botanyMarks ?? null,
        totalScore: body.totalScore ?? null,
        percentile: body.percentile ?? null,
        submittedAt: body.submittedAt ? new Date(body.submittedAt) : null,
    });

    return ApiResponse.created(attempt, "Test attempt saved");
});

export const DELETE = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id } = testIdParamSchema.parse(await params);
    const body = await withValidation(req, deleteTestAttemptsBodySchema);

    const deletedCount = await mockTestService.deleteTestAttempts(id, body.attemptIds);

    return ApiResponse.success(
        {
            deletedCount,
        },
        deletedCount > 0 ? "Test attempts deleted successfully" : "No test attempts were deleted"
    );
});
