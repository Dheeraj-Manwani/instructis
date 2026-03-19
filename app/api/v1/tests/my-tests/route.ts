import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import prisma from "@/lib/prisma";
import * as mockTestRepository from "@/repositories/mock-test.repository";

export const GET = catchAsync(async (req) => {
    const session = await withAuth(req);
    withRole(session, "STUDENT");

    // Student is linked to a single batch via Student.batchId
    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: {
            id: true,
            batchId: true,
            batch: {
                select: {
                    id: true,
                    name: true,
                    examType: true,
                },
            },
        },
    });

    if (!student?.batchId || !student.batch) {
        return ApiResponse.success({
            batch: null,
            tests: [],
        });
    }

    const [tests, attempts] = await Promise.all([
        mockTestRepository.findTestsByBatchId(student.batchId),
        mockTestRepository.findTestAttemptsByStudentInBatch(student.id, student.batchId),
    ]);

    const attemptByMockTestId = new Map(
        attempts.map((a) => [
            a.mockTestId,
            {
                id: a.id,
                submittedAt: a.submittedAt,
                startedAt: a.startedAt,
                physicsMarks: a.physicsMarks,
                chemistryMarks: a.chemistryMarks,
                mathematicsMarks: a.mathematicsMarks,
                zoologyMarks: a.zoologyMarks,
                botanyMarks: a.botanyMarks,
                totalScore: a.totalScore,
                percentile: a.percentile,
                timeTaken: a.timeTaken,
            },
        ]),
    );

    const testsWithAttempts = tests.map((test) => ({
        test,
        attempt: attemptByMockTestId.get(test.id) ?? null,
    }));

    return ApiResponse.success({
        batch: student.batch,
        tests: testsWithAttempts,
    });
});

