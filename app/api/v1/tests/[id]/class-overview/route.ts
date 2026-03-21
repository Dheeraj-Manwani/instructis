import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { ForbiddenError, ValidationError } from "@/lib/utils/errors";
import prisma from "@/lib/prisma";
import { testIdParamSchema } from "@/lib/schemas/mock-test.schema";
import type { ExamType } from "@prisma/client";

export const GET = catchAsync(async (req, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id: testId } = testIdParamSchema.parse(await params);

    const test = await prisma.mockTest.findUnique({
        where: { id: testId },
        select: {
            id: true,
            name: true,
            totalMarks: true,
            totalMarksPhysics: true,
            totalMarksChemistry: true,
            totalMarksMathematics: true,
            totalMarksZoology: true,
            totalMarksBotany: true,
            batchId: true,
            batch: {
                select: {
                    id: true,
                    name: true,
                    examType: true,
                },
            },
            facultyId: true,
            createdAt: true,
        },
    });

    if (!test) throw new ValidationError("Test not found");
    if (!test.batchId || !test.batch) throw new ValidationError("Test is not associated with a batch");

    // Faculty should only access their own tests unless admin.
    if (session.user.role !== "ADMIN") {
        const faculty = await prisma.faculty.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        if (!faculty || faculty.id !== test.facultyId) {
            throw new ForbiddenError("You do not have permission to view this test analysis");
        }
    }

    const batchExamType = test.batch.examType as ExamType;

    const roster = await prisma.student.findMany({
        where: { batchId: test.batchId },
        select: {
            id: true,
            rollNo: true,
            user: {
                select: { id: true, name: true },
            },
        },
        orderBy: { rollNo: "asc" },
    });

    const rosterIds = roster.map((s) => s.id);

    const currentTest = await prisma.mockTest.findUnique({
        where: { id: testId },
        select: { id: true, createdAt: true },
    });

    if (!currentTest) throw new ValidationError("Test not found");

    const attempts = await prisma.testAttempt.findMany({
        where: {
            studentId: { in: rosterIds },
            mockTest: {
                batchId: test.batchId,
            },
        },
        select: {
            id: true,
            studentId: true,
            mockTestId: true,
            submittedAt: true,
            totalScore: true,
            percentile: true,
            physicsMarks: true,
            chemistryMarks: true,
            mathematicsMarks: true,
            zoologyMarks: true,
            botanyMarks: true,
            timeTaken: true,
            mockTest: {
                select: { id: true, createdAt: true },
            },
        },
    });

    const attemptByStudent = new Map<
        string,
        {
            current?: (typeof attempts)[number];
            previous?: (typeof attempts)[number];
        }
    >();

    for (const student of roster) {
        attemptByStudent.set(student.id, {});
    }

    for (const a of attempts) {
        const bucket = attemptByStudent.get(a.studentId);
        if (!bucket) continue;
        if (!a.mockTest) continue;

        if (a.mockTestId === testId) {
            bucket.current = a;
            continue;
        }

        // Previous: last submitted attempt strictly before current test timestamp.
        if (a.mockTest.createdAt < currentTest.createdAt && a.submittedAt !== null && a.totalScore !== null) {
            const previousCreatedAt = bucket.previous?.mockTest?.createdAt;
            if (!previousCreatedAt || a.mockTest.createdAt > previousCreatedAt) {
                bucket.previous = a;
            }
        }
    }

    const studentsWithResults = roster.map((s, idx) => {
        const bucket = attemptByStudent.get(s.id);
        const current = bucket?.current;
        const previous = bucket?.previous;

        const isPending = !current || current.totalScore === null || current.percentile === null;

        const improvementPoints =
            !isPending && previous && previous.totalScore !== null
                ? (current!.totalScore as number) - (previous.totalScore as number)
                : null;

        return {
            studentId: s.id,
            name: s.user.name,
            rollNo: s.rollNo,
            avatarInitial: s.user.name?.charAt(0)?.toUpperCase() ?? "",
            attemptId: current?.id ?? null,
            pending: isPending,
            physicsMarks: current?.physicsMarks ?? null,
            chemistryMarks: current?.chemistryMarks ?? null,
            mathematicsMarks: current?.mathematicsMarks ?? null,
            zoologyMarks: current?.zoologyMarks ?? null,
            botanyMarks: current?.botanyMarks ?? null,
            totalScore: current?.totalScore ?? null,
            percentile: current?.percentile ?? null,
            timeTaken: current?.timeTaken ?? null,
            improvementPoints,
            rank: null as number | null,
            index: idx,
        };
    });

    const attempted = studentsWithResults.filter((s) => !s.pending && typeof s.percentile === "number");

    attempted.sort((a, b) => {
        const pA = a.percentile as number;
        const pB = b.percentile as number;
        if (pB !== pA) return pB - pA;
        return (b.totalScore ?? 0) - (a.totalScore ?? 0);
    });

    attempted.forEach((s, i) => {
        s.rank = i + 1;
    });

    const attemptedPercentiles = attempted.map((s) => s.percentile as number);
    const classAveragePercentile =
        attemptedPercentiles.length > 0
            ? attemptedPercentiles.reduce((sum, p) => sum + p, 0) / attemptedPercentiles.length
            : null;
    const highestPercentile = attemptedPercentiles.length > 0 ? Math.max(...attemptedPercentiles) : null;

    // Sort all students: attempted (already has rank) first by rank, pending at the end preserving roster order.
    studentsWithResults.sort((a, b) => {
        if (a.pending && b.pending) return a.index - b.index;
        if (a.pending) return 1;
        if (b.pending) return -1;
        return (a.rank ?? 999999) - (b.rank ?? 999999);
    });

    return ApiResponse.success({
        test: {
            id: test.id,
            name: test.name,
            totalMarks: test.totalMarks,
            totalMarksPhysics: test.totalMarksPhysics,
            totalMarksChemistry: test.totalMarksChemistry,
            totalMarksMathematics: test.totalMarksMathematics,
            totalMarksZoology: test.totalMarksZoology,
            totalMarksBotany: test.totalMarksBotany,
        },
        batch: {
            id: test.batch.id,
            name: test.batch.name,
            examType: batchExamType,
        },
        stats: {
            totalStudentsAttempted: attempted.length,
            classAveragePercentile,
            highestPercentile,
        },
        students: studentsWithResults.map(({ index, ...rest }) => {
            void index;
            return rest;
        }),
    });
});

