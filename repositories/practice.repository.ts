import prisma from "@/lib/prisma";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";

type PriorityValue = "HIGH" | "MEDIUM" | "LOW";

export type PracticeWeakAreaItem = {
    id: string;
    topicId: string;
    topicName: string;
    subject: string;
    priority: PriorityValue;
    drawbackPoints: number;
    availablePracticeQuestions: number;
};

export type PracticeQuestionItem = {
    id: string;
    topicId: string | null;
    topicName: string | null;
    subject: string;
    type: string;
    text: string;
    explanation: string | null;
    options: Array<{ id: string; text: string; isCorrect: boolean; orderIndex: number }>;
};

function priorityRank(priority: PriorityValue): number {
    if (priority === "HIGH") return 0;
    if (priority === "MEDIUM") return 1;
    return 2;
}

export async function getPracticeDataForStudent(
    userId: string,
    selectedTopicId?: string
): Promise<{
    weakAreas: PracticeWeakAreaItem[];
    selectedTopicId: string | null;
    questions: PracticeQuestionItem[];
}> {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: {
            id: true,
            weakAreas: {
                orderBy: [{ priority: "asc" }, { drawbackPoints: "desc" }],
                select: {
                    id: true,
                    topicId: true,
                    drawbackPoints: true,
                    priority: true,
                    topic: {
                        select: {
                            id: true,
                            name: true,
                            subject: true,
                        },
                    },
                },
            },
        },
    });

    if (!student) {
        throw new NotFoundError("Student profile not found");
    }

    if (student.weakAreas.length === 0) {
        return { weakAreas: [], selectedTopicId: null, questions: [] };
    }

    const topicIds = student.weakAreas.map((wa) => wa.topicId);
    const groupedCounts = await prisma.question.groupBy({
        by: ["topicId"],
        where: {
            isPractice: true,
            topicId: { in: topicIds },
        },
        _count: {
            _all: true,
        },
    });
    const countMap = new Map(groupedCounts.map((row) => [row.topicId ?? "", row._count._all]));

    const weakAreas: PracticeWeakAreaItem[] = student.weakAreas.map((wa) => ({
        id: wa.id,
        topicId: wa.topicId,
        topicName: wa.topic.name,
        subject: wa.topic.subject,
        priority: wa.priority,
        drawbackPoints: wa.drawbackPoints,
        availablePracticeQuestions: countMap.get(wa.topicId) ?? 0,
    }));

    const validSelected =
        selectedTopicId === "all"
            ? "all"
            : weakAreas.some((wa) => wa.topicId === selectedTopicId)
                ? selectedTopicId
                : weakAreas[0]?.topicId;

    if (!validSelected) {
        return { weakAreas, selectedTopicId: null, questions: [] };
    }

    const baseWhere = {
        isPractice: true,
        topicId: {
            in: topicIds,
        },
    } as const;

    const questions = await prisma.question.findMany({
        where:
            validSelected === "all"
                ? baseWhere
                : {
                    isPractice: true,
                    topicId: validSelected,
                },
        include: {
            topic: {
                select: {
                    id: true,
                    name: true,
                },
            },
            options: {
                orderBy: { orderIndex: "asc" },
            },
        },
        orderBy: [{ createdAt: "desc" }],
    });

    const weakAreaSortMap = new Map(
        weakAreas.map((wa) => [wa.topicId, { priority: wa.priority, drawbackPoints: wa.drawbackPoints }])
    );

    const sortedQuestions =
        validSelected === "all"
            ? [...questions].sort((a, b) => {
                const aMeta = weakAreaSortMap.get(a.topicId ?? "");
                const bMeta = weakAreaSortMap.get(b.topicId ?? "");
                const aPriority = priorityRank(aMeta?.priority ?? "LOW");
                const bPriority = priorityRank(bMeta?.priority ?? "LOW");
                if (aPriority !== bPriority) return aPriority - bPriority;
                return (bMeta?.drawbackPoints ?? 0) - (aMeta?.drawbackPoints ?? 0);
            })
            : questions;

    return {
        weakAreas,
        selectedTopicId: validSelected,
        questions: sortedQuestions.map((q) => ({
            id: q.id,
            topicId: q.topicId,
            topicName: q.topic?.name ?? null,
            subject: q.subject,
            type: q.type,
            text: q.text,
            explanation: q.explanation,
            options: q.options.map((o) => ({
                id: o.id,
                text: o.text,
                isCorrect: o.isCorrect,
                orderIndex: o.orderIndex,
            })),
        })),
    };
}

export async function findStudentIdByUserId(userId: string): Promise<string | null> {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: { id: true },
    });
    return student?.id ?? null;
}

export async function createPracticeAttempt(studentId: string, topicId?: string): Promise<{ attemptId: string }> {
    const attempt = await prisma.testAttempt.create({
        data: {
            studentId,
            mockTestId: null,
            isPracticeAttempt: true,
            practiceTopicId: topicId ?? null,
            submittedAt: new Date(),
        },
        select: { id: true },
    });
    return { attemptId: attempt.id };
}

export async function submitPracticeAnswer(input: {
    userId: string;
    attemptId: string;
    questionId: string;
    selectedOptionId?: string;
    numericalAnswer?: number;
}): Promise<{
    isCorrect: boolean;
    marksAwarded: number;
    correctOptionId: string | null;
    explanation: string | null;
}> {
    const attempt = await prisma.testAttempt.findFirst({
        where: {
            id: input.attemptId,
            isPracticeAttempt: true,
            student: {
                userId: input.userId,
            },
        },
        select: { id: true },
    });
    if (!attempt) {
        throw new ValidationError("Invalid practice attempt");
    }

    const question = await prisma.question.findUnique({
        where: { id: input.questionId },
        include: {
            options: {
                orderBy: { orderIndex: "asc" },
            },
        },
    });
    if (!question || !question.isPractice) {
        throw new ValidationError("Practice question not found");
    }

    let isCorrect = false;
    const correctOption = question.options.find((opt) => opt.isCorrect) ?? null;

    if (question.type === "NUMERICAL") {
        if (typeof input.numericalAnswer !== "number") {
            throw new ValidationError("Numerical answer is required");
        }
        const correctValue = correctOption ? Number(correctOption.text) : Number.NaN;
        if (!Number.isNaN(correctValue)) {
            isCorrect = Math.abs(input.numericalAnswer - correctValue) < 1e-6;
        }
    } else {
        if (!input.selectedOptionId) {
            throw new ValidationError("Please select an option");
        }
        isCorrect = question.options.some(
            (opt) => opt.id === input.selectedOptionId && opt.isCorrect
        );
    }

    const marksAwarded = isCorrect ? 4 : 0;

    await prisma.$transaction([
        prisma.studentAnswer.deleteMany({
            where: {
                attemptId: input.attemptId,
                questionId: input.questionId,
            },
        }),
        prisma.studentAnswer.create({
            data: {
                attemptId: input.attemptId,
                questionId: input.questionId,
                selectedOptionId: input.selectedOptionId ?? null,
                numericalAnswer: input.numericalAnswer ?? null,
                isCorrect,
                marksAwarded,
            },
        }),
    ]);

    return {
        isCorrect,
        marksAwarded,
        correctOptionId: correctOption?.id ?? null,
        explanation: question.explanation ?? null,
    };
}
