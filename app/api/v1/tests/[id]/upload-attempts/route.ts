import { NextRequest } from "next/server";

import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import prisma from "@/lib/prisma";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import { testIdParamSchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import * as batchService from "@/services/batch.service";
import { parseImportedAttemptsFromWorkbook, type ImportTemplateKind } from "@/lib/utils/test-attempt-import";
import * as markRepository from "@/repositories/mark.repository";

export const POST = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id: testId } = testIdParamSchema.parse(await params);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
        throw new ValidationError("No Excel file uploaded");
    }

    const arrayBuffer = await file.arrayBuffer();
    const templateKindRaw = formData.get("templateKind");
    let forcedTemplateKind: ImportTemplateKind | undefined;
    if (templateKindRaw === "subject-marks" || templateKindRaw === "question-answers") {
        forcedTemplateKind = templateKindRaw;
    }

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

    const { templateKind, attempts } = await parseImportedAttemptsFromWorkbook(
        arrayBuffer,
        {
            examType: batch.examType,
            roster,
            testMaxMarks: test,
            testQuestions,
        },
        forcedTemplateKind
    );

    // Persist attempts
    const createdOrUpdated = [];
    for (const row of attempts) {
        const percentile = test.totalMarks > 0 ? (row.totalScore / test.totalMarks) * 100 : null;
        const attempt = await prisma.$transaction(async (tx) => {
            const persistedAttempt = await mockTestService.createOrUpdateTestAttempt(
                {
                    studentId: row.studentId,
                    mockTestId: testId,
                    physicsMarks: row.physicsMarks,
                    chemistryMarks: row.chemistryMarks,
                    mathematicsMarks: row.mathematicsMarks,
                    zoologyMarks: row.zoologyMarks,
                    botanyMarks: row.botanyMarks,
                    totalScore: row.totalScore,
                    percentile,
                },
                tx
            );

            await markRepository.syncMarksForAttempt(
                {
                    studentId: row.studentId,
                    facultyId: test.facultyId,
                    batchId: test.batchId ?? null,
                    testName: test.name,
                    examType: batch.examType,
                    percentile,
                    attemptMarks: {
                        physicsMarks: row.physicsMarks,
                        chemistryMarks: row.chemistryMarks,
                        mathematicsMarks: row.mathematicsMarks,
                        zoologyMarks: row.zoologyMarks,
                        botanyMarks: row.botanyMarks,
                    },
                    testMaxMarks: {
                        totalMarks: test.totalMarks,
                        totalMarksPhysics: test.totalMarksPhysics,
                        totalMarksChemistry: test.totalMarksChemistry,
                        totalMarksMathematics: test.totalMarksMathematics,
                        totalMarksZoology: test.totalMarksZoology,
                        totalMarksBotany: test.totalMarksBotany,
                    },
                },
                tx
            );

            if (templateKind === "question-answers") {
                await tx.studentAnswer.deleteMany({ where: { attemptId: persistedAttempt.id } });
                if (row.answers && row.answers.length > 0) {
                    await tx.studentAnswer.createMany({
                        data: row.answers.map((a) => ({
                            attemptId: persistedAttempt.id,
                            questionId: a.questionId,
                            selectedOptionId: a.selectedOptionId,
                            isCorrect: a.isCorrect,
                            marksAwarded: a.marksAwarded,
                        })),
                    });
                }
            }

            return persistedAttempt;
        }, { maxWait: 10000, timeout: 20000 });

        createdOrUpdated.push(attempt);
    }

    const message =
        templateKind === "question-answers"
            ? "Question-answer attempts uploaded successfully"
            : "Test attempts uploaded successfully";
    return ApiResponse.created(createdOrUpdated, message);
});

