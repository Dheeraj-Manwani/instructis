import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ForbiddenError, NotFoundError } from "@/lib/utils/errors";

export const GET = catchAsync(async (req, { params }) => {
    const session = await withAuth(req);
    withRole(session, "STUDENT");

    const attemptId = z.string().min(1).parse((await params)?.attemptId);

    const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
            student: {
                select: {
                    id: true,
                    rollNo: true,
                    user: {
                        select: { id: true, name: true },
                    },
                },
            },
            mockTest: {
                select: {
                    id: true,
                    name: true,
                    duration: true,
                    totalMarks: true,
                    batch: {
                        select: {
                            id: true,
                            name: true,
                            examType: true,
                        },
                    },
                },
            },
        },
    });

    if (!attempt) {
        throw new NotFoundError("Test attempt not found");
    }

    // Students should only access their own attempt analysis
    if (attempt.student.user.id !== session.user.id) {
        throw new ForbiddenError("You do not have permission to view this analysis");
    }

    const [mockQuestions, studentAnswers] = await Promise.all([
        prisma.mockTestQuestion.findMany({
            where: { mockTestId: attempt.mockTestId },
            select: { questionId: true, orderIndex: true },
            orderBy: { orderIndex: "asc" },
        }),
        prisma.studentAnswer.findMany({
            where: { attemptId },
            include: {
                question: {
                    select: {
                        id: true,
                        text: true,
                        type: true,
                        subject: true,
                        topic: { select: { name: true } },
                        explanation: true,
                        options: {
                            orderBy: { orderIndex: "asc" },
                            select: { id: true, text: true, isCorrect: true, orderIndex: true },
                        },
                    },
                },
            },
            // Sorting in-code based on MockTestQuestion.orderIndex
        }),
    ]);

    const orderByQuestionId = new Map(
        mockQuestions.map((q) => [q.questionId, q.orderIndex]),
    );

    const correctOptionTextFor = (questionOptions: { id: string; text: string; isCorrect: boolean }[]) => {
        return questionOptions.find((o) => o.isCorrect)?.text ?? "N/A";
    };

    const yourAnswerFor = (
        answer: { selectedOptionId: string | null; numericalAnswer: number | null },
        questionOptions: { id: string; text: string }[],
    ) => {
        if (answer.selectedOptionId) {
            return questionOptions.find((o) => o.id === answer.selectedOptionId)?.text ?? "Not Answered";
        }
        if (answer.numericalAnswer !== null && answer.numericalAnswer !== undefined) {
            return String(answer.numericalAnswer);
        }
        return "Not Answered";
    };

    const questions = studentAnswers
        .map((a) => {
            const orderIndex = orderByQuestionId.get(a.questionId) ?? Number.POSITIVE_INFINITY;
            const question = a.question;

            const correctAnswer = correctOptionTextFor(
                question.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
            );

            const yourAnswer = yourAnswerFor(
                { selectedOptionId: a.selectedOptionId, numericalAnswer: a.numericalAnswer },
                question.options.map((o) => ({ id: o.id, text: o.text })),
            );

            const isCorrect =
                a.isCorrect ??
                (a.marksAwarded !== null && a.marksAwarded !== undefined ? a.marksAwarded > 0 : false);

            return {
                orderIndex,
                questionId: question.id,
                subject: question.subject,
                topicName: question.topic?.name ?? null,
                questionText: question.text,
                explanation: question.explanation,
                yourAnswer,
                correctAnswer,
                isCorrect,
                marksAwarded: a.marksAwarded,
            };
        })
        .sort((x, y) => x.orderIndex - y.orderIndex);

    return ApiResponse.success({
        attempt: {
            id: attempt.id,
            submittedAt: attempt.submittedAt,
            totalScore: attempt.totalScore,
            percentile: attempt.percentile,
        },
        batch: attempt.mockTest.batch,
        test: {
            id: attempt.mockTest.id,
            name: attempt.mockTest.name,
            duration: attempt.mockTest.duration,
            totalMarks: attempt.mockTest.totalMarks,
        },
        student: {
            id: attempt.student.id,
            name: attempt.student.user.name,
            rollNo: attempt.student.rollNo,
        },
        questions,
    });
});

