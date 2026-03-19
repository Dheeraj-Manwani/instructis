import prisma from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import { ExamType } from "@prisma/client";

export type MockTestListItem = {
    id: string;
    name: string;
    batchId: string | null;
    facultyId: string;
    duration: number;
    totalMarks: number;
    isPublished: boolean;
    scheduledAt: Date | null;
    createdAt: Date;
};

export async function findTestsByBatchId(batchId: string): Promise<MockTestListItem[]> {
    const tests = await prisma.mockTest.findMany({
        where: { batchId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            batchId: true,
            facultyId: true,
            duration: true,
            totalMarks: true,
            isPublished: true,
            scheduledAt: true,
            createdAt: true,
        },
    });

    return tests;
}

export type CreateMockTestInput = {
    name: string;
    batchId: string | null;
    facultyId: string;
    duration: number;
    totalMarks: number;
    totalMarksPhysics?: number | null;
    totalMarksChemistry?: number | null;
    totalMarksMathematics?: number | null;
    totalMarksZoology?: number | null;
    totalMarksBotany?: number | null;
    isPublished?: boolean;
    scheduledAt?: Date | null;
};

export async function createMockTest(data: CreateMockTestInput): Promise<MockTestListItem> {
    const test = await prisma.mockTest.create({
        data,
        select: {
            id: true,
            name: true,
            batchId: true,
            facultyId: true,
            duration: true,
            totalMarks: true,
            isPublished: true,
            scheduledAt: true,
            createdAt: true,
        },
    });

    return test;
}

export async function getTestByIdOrThrow(testId: string): Promise<MockTestListItem> {
    const test = await prisma.mockTest.findUnique({
        where: { id: testId },
        select: {
            id: true,
            name: true,
            batchId: true,
            facultyId: true,
            duration: true,
            totalMarks: true,
            totalMarksPhysics: true,
            totalMarksChemistry: true,
            totalMarksMathematics: true,
            totalMarksZoology: true,
            totalMarksBotany: true,
            isPublished: true,
            scheduledAt: true,
            createdAt: true,
        },
    });

    if (!test) {
        throw new NotFoundError("Test not found");
    }

    return test;
}

export type TestQuestionListItem = {
    id: string;
    mockTestId: string;
    questionId: string;
    orderIndex: number;
    marks: number;
    negMarks: number;
    question: {
        id: string;
        text: string;
        difficulty: string;
        subject: string;
        topicName: string | null;
    };
};

function mapTestQuestion(item: {
    id: string;
    mockTestId: string;
    questionId: string;
    orderIndex: number;
    marks: number;
    negMarks: number;
    question: {
        id: string;
        text: string;
        difficulty: string;
        subject: string;
        topic: { name: string } | null;
    };
}): TestQuestionListItem {
    return {
        id: item.id,
        mockTestId: item.mockTestId,
        questionId: item.questionId,
        orderIndex: item.orderIndex,
        marks: item.marks,
        negMarks: item.negMarks,
        question: {
            id: item.question.id,
            text: item.question.text,
            difficulty: item.question.difficulty,
            subject: item.question.subject,
            topicName: item.question.topic?.name ?? null,
        },
    };
}

export async function findTestQuestionsByTestId(testId: string): Promise<TestQuestionListItem[]> {
    const rows = await prisma.mockTestQuestion.findMany({
        where: { mockTestId: testId },
        include: {
            question: {
                select: {
                    id: true,
                    text: true,
                    difficulty: true,
                    subject: true,
                    topic: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: { orderIndex: "asc" },
    });

    return rows.map(mapTestQuestion);
}

export async function addQuestionToTest(
    testId: string,
    questionId: string,
    marks = 4,
    negMarks = 1
): Promise<TestQuestionListItem> {
    const existing = await prisma.mockTestQuestion.findFirst({
        where: { mockTestId: testId, questionId },
        include: {
            question: {
                select: {
                    id: true,
                    text: true,
                    difficulty: true,
                    subject: true,
                    topic: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    if (existing) return mapTestQuestion(existing);

    // Validate that question's subject is allowed for the test's exam type.
    const mockTest = await prisma.mockTest.findUnique({
        where: { id: testId },
        select: {
            batchId: true,
            batch: {
                select: { examType: true },
            },
        },
    });

    if (!mockTest || !mockTest.batch) {
        throw new ValidationError("Test is not associated with a batch/exam type");
    }

    const examType = mockTest.batch.examType as ExamType;
    const allowedSubjects =
        examType === ExamType.JEE
            ? ["PHYSICS", "CHEMISTRY", "MATHEMATICS"]
            : ["PHYSICS", "CHEMISTRY", "ZOOLOGY", "BOTANY"];

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { subject: true },
    });

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    if (!allowedSubjects.includes(question.subject)) {
        throw new ValidationError(
            `Question subject '${question.subject}' cannot be added to a ${examType} test`
        );
    }

    const maxOrder = await prisma.mockTestQuestion.aggregate({
        where: { mockTestId: testId },
        _max: { orderIndex: true },
    });
    const nextOrder = (maxOrder._max.orderIndex ?? 0) + 1;

    const created = await prisma.mockTestQuestion.create({
        data: {
            mockTestId: testId,
            questionId,
            marks,
            negMarks,
            orderIndex: nextOrder,
        },
        include: {
            question: {
                select: {
                    id: true,
                    text: true,
                    difficulty: true,
                    subject: true,
                    topic: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    return mapTestQuestion(created);
}

export async function updateTestQuestion(
    testId: string,
    testQuestionId: string,
    data: Partial<{ marks: number; negMarks: number; orderIndex: number }>
): Promise<TestQuestionListItem> {
    const existing = await prisma.mockTestQuestion.findFirst({
        where: { id: testQuestionId, mockTestId: testId },
        select: { id: true },
    });
    if (!existing) {
        throw new NotFoundError("Test question not found");
    }

    const updated = await prisma.mockTestQuestion.update({
        where: { id: testQuestionId },
        data,
        include: {
            question: {
                select: {
                    id: true,
                    text: true,
                    difficulty: true,
                    subject: true,
                    topic: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    return mapTestQuestion(updated);
}

export async function removeQuestionFromTest(testId: string, testQuestionId: string): Promise<void> {
    const existing = await prisma.mockTestQuestion.findFirst({
        where: { id: testQuestionId, mockTestId: testId },
        select: { id: true },
    });
    if (!existing) {
        throw new NotFoundError("Test question not found");
    }

    await prisma.mockTestQuestion.delete({
        where: { id: testQuestionId },
    });
}

export type TestAttemptListItem = {
    id: string;
    studentId: string;
    mockTestId: string;
    student: {
        id: string;
        rollNo: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
    startedAt: Date;
    submittedAt: Date | null;
    physicsMarks: number | null;
    chemistryMarks: number | null;
    mathematicsMarks: number | null;
    zoologyMarks: number | null;
    botanyMarks: number | null;
    totalScore: number | null;
    percentile: number | null;
    timeTaken: number | null;
    isNotified: boolean;
};

export async function findTestAttemptsByTestId(testId: string): Promise<TestAttemptListItem[]> {
    const attempts = await prisma.testAttempt.findMany({
        where: { mockTestId: testId },
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: { startedAt: "desc" },
    });

    return attempts.map((attempt) => ({
        id: attempt.id,
        studentId: attempt.studentId,
        mockTestId: attempt.mockTestId,
        student: {
            id: attempt.student.id,
            rollNo: attempt.student.rollNo,
            user: attempt.student.user,
        },
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        physicsMarks: attempt.physicsMarks,
        chemistryMarks: attempt.chemistryMarks,
        mathematicsMarks: attempt.mathematicsMarks,
        zoologyMarks: attempt.zoologyMarks,
        botanyMarks: attempt.botanyMarks,
        totalScore: attempt.totalScore,
        percentile: attempt.percentile,
        timeTaken: attempt.timeTaken,
        isNotified: attempt.isNotified,
    }));
}

export async function findTestAttemptsByStudentInBatch(
    studentId: string,
    batchId: string
): Promise<
    Array<
        TestAttemptListItem & {
            mockTest: {
                id: string;
                name: string;
            };
        }
    >
> {
    const attempts = await prisma.testAttempt.findMany({
        where: {
            studentId,
            mockTest: {
                batchId,
            },
        },
        include: {
            mockTest: {
                select: {
                    id: true,
                    name: true,
                },
            },
            student: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: { startedAt: "asc" },
    });

    return attempts.map((attempt) => ({
        id: attempt.id,
        studentId: attempt.studentId,
        mockTestId: attempt.mockTestId,
        student: {
            id: attempt.student.id,
            rollNo: attempt.student.rollNo,
            user: attempt.student.user,
        },
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        physicsMarks: attempt.physicsMarks,
        chemistryMarks: attempt.chemistryMarks,
        mathematicsMarks: attempt.mathematicsMarks,
        zoologyMarks: attempt.zoologyMarks,
        botanyMarks: attempt.botanyMarks,
        totalScore: attempt.totalScore,
        percentile: attempt.percentile,
        timeTaken: attempt.timeTaken,
        isNotified: attempt.isNotified,
        mockTest: attempt.mockTest,
    }));
}

export type UpdateMockTestInput = Partial<{
    name: string;
    duration: number;
    totalMarks: number;
    totalMarksPhysics: number | null;
    totalMarksChemistry: number | null;
    totalMarksMathematics: number | null;
    totalMarksZoology: number | null;
    totalMarksBotany: number | null;
    isPublished: boolean;
    scheduledAt: Date | null;
}>;

export async function updateMockTest(testId: string, data: UpdateMockTestInput): Promise<MockTestListItem> {
    const test = await prisma.mockTest.update({
        where: { id: testId },
        data,
        select: {
            id: true,
            name: true,
            batchId: true,
            facultyId: true,
            duration: true,
            totalMarks: true,
            isPublished: true,
            scheduledAt: true,
            createdAt: true,
        },
    });

    return test;
}

export type CreateTestAttemptInput = {
    studentId: string;
    mockTestId: string;
    physicsMarks?: number | null;
    chemistryMarks?: number | null;
    mathematicsMarks?: number | null;
    zoologyMarks?: number | null;
    botanyMarks?: number | null;
    totalScore?: number | null;
    percentile?: number | null;
    submittedAt?: Date | null;
};

export async function createOrUpdateTestAttempt(data: CreateTestAttemptInput): Promise<TestAttemptListItem> {
    // Check if attempt already exists
    const existing = await prisma.testAttempt.findFirst({
        where: {
            studentId: data.studentId,
            mockTestId: data.mockTestId,
        },
    });

    if (existing) {
        // Update existing attempt
        const attempt = await prisma.testAttempt.update({
            where: { id: existing.id },
            data: {
                physicsMarks: data.physicsMarks,
                chemistryMarks: data.chemistryMarks,
                mathematicsMarks: data.mathematicsMarks,
                zoologyMarks: data.zoologyMarks,
                botanyMarks: data.botanyMarks,
                totalScore: data.totalScore,
                percentile: data.percentile,
                submittedAt: data.submittedAt || existing.submittedAt,
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            id: attempt.id,
            studentId: attempt.studentId,
            mockTestId: attempt.mockTestId,
            student: {
                id: attempt.student.id,
                rollNo: attempt.student.rollNo,
                user: attempt.student.user,
            },
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt,
            physicsMarks: attempt.physicsMarks,
            chemistryMarks: attempt.chemistryMarks,
            mathematicsMarks: attempt.mathematicsMarks,
            zoologyMarks: attempt.zoologyMarks,
            botanyMarks: attempt.botanyMarks,
            totalScore: attempt.totalScore,
            percentile: attempt.percentile,
            timeTaken: attempt.timeTaken,
            isNotified: attempt.isNotified,
        };
    } else {
        // Create new attempt
        const attempt = await prisma.testAttempt.create({
            data: {
                studentId: data.studentId,
                mockTestId: data.mockTestId,
                physicsMarks: data.physicsMarks,
                chemistryMarks: data.chemistryMarks,
                mathematicsMarks: data.mathematicsMarks,
                zoologyMarks: data.zoologyMarks,
                botanyMarks: data.botanyMarks,
                totalScore: data.totalScore,
                percentile: data.percentile,
                submittedAt: data.submittedAt,
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return {
            id: attempt.id,
            studentId: attempt.studentId,
            mockTestId: attempt.mockTestId,
            student: {
                id: attempt.student.id,
                rollNo: attempt.student.rollNo,
                user: attempt.student.user,
            },
            startedAt: attempt.startedAt,
            submittedAt: attempt.submittedAt,
            physicsMarks: attempt.physicsMarks,
            chemistryMarks: attempt.chemistryMarks,
            mathematicsMarks: attempt.mathematicsMarks,
            zoologyMarks: attempt.zoologyMarks,
            botanyMarks: attempt.botanyMarks,
            totalScore: attempt.totalScore,
            percentile: attempt.percentile,
            timeTaken: attempt.timeTaken,
            isNotified: attempt.isNotified,
        };
    }
}

export async function getTestAttemptWithStudentAndTestOrThrow(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            mockTest: true,
        },
    });

    if (!attempt) {
        throw new NotFoundError("Test attempt not found");
    }

    return attempt;
}

export async function markTestAttemptNotified(attemptId: string): Promise<TestAttemptListItem> {
    const attempt = await prisma.testAttempt.update({
        where: { id: attemptId },
        data: { isNotified: true },
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    return {
        id: attempt.id,
        studentId: attempt.studentId,
        mockTestId: attempt.mockTestId,
        student: {
            id: attempt.student.id,
            rollNo: attempt.student.rollNo,
            user: attempt.student.user,
        },
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        physicsMarks: attempt.physicsMarks,
        chemistryMarks: attempt.chemistryMarks,
        mathematicsMarks: attempt.mathematicsMarks,
        zoologyMarks: attempt.zoologyMarks,
        botanyMarks: attempt.botanyMarks,
        totalScore: attempt.totalScore,
        percentile: attempt.percentile,
        timeTaken: attempt.timeTaken,
        isNotified: attempt.isNotified,
    };
}

export async function deleteTestAttemptsByIds(testId: string, attemptIds: string[]): Promise<number> {
    const result = await prisma.testAttempt.deleteMany({
        where: {
            id: {
                in: attemptIds,
            },
            mockTestId: testId,
        },
    });

    return result.count;
}