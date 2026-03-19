import { NextRequest } from "next/server";

import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import { testIdParamSchema, importGoogleSheetBodySchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import * as batchService from "@/services/batch.service";
import prisma from "@/lib/prisma";
import { parseImportedAttemptsFromWorkbook } from "@/lib/utils/test-attempt-import";

export const POST = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id: testId } = testIdParamSchema.parse(await params);
    const { url } = await withValidation(req, importGoogleSheetBodySchema);

    // Google Sheets export URL is expected to return an xlsx file
    const response = await fetch(url);
    if (!response.ok) {
        throw new ValidationError("Failed to download Google Sheet. Please check that the URL is correct and publicly accessible.");
    }

    const arrayBuffer = await response.arrayBuffer();

    // Get test and batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const test = (await mockTestService.getTestById(testId)) as any;
    if (!test.batchId) {
        throw new ValidationError("Test is not associated with a batch");
    }

    const batch = await batchService.getBatchById(test.batchId);
    const roster = await batchService.getStudentsInBatch(test.batchId);
    const testQuestions = await prisma.mockTestQuestion.findMany({
        where: { mockTestId: testId },
        select: {
            questionId: true,
            orderIndex: true,
            marks: true,
            negMarks: true,
            question: {
                select: {
                    id: true,
                    text: true,
                    subject: true,
                    difficulty: true,
                    topic: { select: { name: true } },
                    options: {
                        select: {
                            id: true,
                            text: true,
                            isCorrect: true,
                            orderIndex: true,
                        },
                        orderBy: { orderIndex: "asc" },
                    },
                },
            },
        },
        orderBy: { orderIndex: "asc" },
    });
    const { templateKind, attempts } = await parseImportedAttemptsFromWorkbook(arrayBuffer, {
        examType: batch.examType,
        roster,
        testMaxMarks: test,
        testQuestions,
    });

    const createdOrUpdated = [];

    for (const row of attempts) {
        const attempt = await mockTestService.createOrUpdateTestAttempt({
            studentId: row.studentId,
            mockTestId: testId,
            physicsMarks: row.physicsMarks,
            chemistryMarks: row.chemistryMarks,
            mathematicsMarks: row.mathematicsMarks,
            zoologyMarks: row.zoologyMarks,
            botanyMarks: row.botanyMarks,
            totalScore: row.totalScore,
        });

        if (templateKind === "question-answers") {
            await prisma.studentAnswer.deleteMany({ where: { attemptId: attempt.id } });
            if (row.answers && row.answers.length > 0) {
                await prisma.studentAnswer.createMany({
                    data: row.answers.map((a) => ({
                        attemptId: attempt.id,
                        questionId: a.questionId,
                        selectedOptionId: a.selectedOptionId,
                        isCorrect: a.isCorrect,
                        marksAwarded: a.marksAwarded,
                    })),
                });
            }
        }

        createdOrUpdated.push(attempt);
    }

    const message =
        templateKind === "question-answers"
            ? "Question-answer attempts imported from Google Sheets successfully"
            : "Test attempts imported from Google Sheets successfully";
    return ApiResponse.created(createdOrUpdated, message);
});

