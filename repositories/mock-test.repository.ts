import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";

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

export type TestAttemptListItem = {
    id: string;
    studentId: string;
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
        };
    }
}