import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import * as mockTestService from "@/services/mock-test.service";
import { NextRequest } from "next/server";
import { z } from "zod";

const testIdParamSchema = z.object({
    id: z.string().min(1, "Test ID is required"),
});

const createTestAttemptBodySchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    physicsMarks: z.coerce.number().optional().nullable(),
    chemistryMarks: z.coerce.number().optional().nullable(),
    mathematicsMarks: z.coerce.number().optional().nullable(),
    zoologyMarks: z.coerce.number().optional().nullable(),
    botanyMarks: z.coerce.number().optional().nullable(),
    totalScore: z.coerce.number().optional().nullable(),
    percentile: z.coerce.number().optional().nullable(),
    submittedAt: z.string().datetime().optional().nullable(),
});

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
