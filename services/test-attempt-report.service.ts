import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import StudentReportPdf, { type StudentReportPdfData } from "@/components/test-results/student-report-pdf";

function sanitizeFilename(value: string) {
    return value.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_");
}

function formatDateDDMMYYYY(value: Date) {
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const yyyy = value.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

async function fetchLogoBase64(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Failed to fetch logo");
    }
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = res.headers.get("content-type") ?? "image/png";
    return `data:${mimeType};base64,${base64}`;
}

export async function generateTestAttemptReportPdf(attemptId: string): Promise<{
    pdfBytes: Uint8Array;
    filename: string;
}> {
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
                    totalMarks: true,
                    duration: true,
                    batch: {
                        select: {
                            name: true,
                            examType: true,
                        },
                    },
                    questions: {
                        select: {
                            questionId: true,
                            orderIndex: true,
                            marks: true,
                            question: {
                                select: { subject: true },
                            },
                        },
                        orderBy: { orderIndex: "asc" },
                    },
                },
            },
            answers: {
                include: {
                    question: {
                        select: {
                            id: true,
                            text: true,
                            subject: true,
                            topic: {
                                select: { name: true },
                            },
                            explanation: true,
                            options: {
                                orderBy: { orderIndex: "asc" },
                                select: {
                                    id: true,
                                    text: true,
                                    isCorrect: true,
                                    orderIndex: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!attempt) {
        throw new NotFoundError("Test attempt not found");
    }

    const allAttempts = await prisma.testAttempt.findMany({
        where: { mockTestId: attempt.mockTestId },
        select: {
            id: true,
            totalScore: true,
            percentile: true,
        },
    });

    const rankSorted = [...allAttempts].sort((a, b) => {
        const scoreA = a.totalScore ?? Number.NEGATIVE_INFINITY;
        const scoreB = b.totalScore ?? Number.NEGATIVE_INFINITY;
        return scoreB - scoreA;
    });
    const classRank = rankSorted.findIndex((a) => a.id === attempt.id) + 1 || null;

    const percentileValues = allAttempts
        .map((a) => a.percentile)
        .filter((v): v is number => typeof v === "number");
    const classAveragePercentile =
        percentileValues.length > 0
            ? percentileValues.reduce((sum, val) => sum + val, 0) / percentileValues.length
            : null;
    const highestPercentile = percentileValues.length > 0 ? Math.max(...percentileValues) : null;

    const orderByQuestionId = new Map(
        attempt.mockTest.questions.map((q) => [q.questionId, q.orderIndex])
    );

    const maxMarksBySubject = new Map<string, number>();
    for (const q of attempt.mockTest.questions) {
        const subject = q.question.subject;
        maxMarksBySubject.set(subject, (maxMarksBySubject.get(subject) ?? 0) + q.marks);
    }

    const subjectMap = new Map<
        string,
        { total: number; correct: number; incorrect: number; unattempted: number; marks: number }
    >();
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let answeredCount = 0;

    for (const answer of attempt.answers) {
        const subject = answer.question.subject;
        const row = subjectMap.get(subject) ?? {
            total: 0,
            correct: 0,
            incorrect: 0,
            unattempted: 0,
            marks: 0,
        };
        row.total += 1;

        if (answer.isCorrect === true) {
            row.correct += 1;
            correctCount += 1;
            row.marks += answer.marksAwarded ?? 0;
        } else if (answer.isCorrect === false) {
            row.incorrect += 1;
            incorrectCount += 1;
            row.marks += answer.marksAwarded ?? 0;
        }

        const attempted = answer.selectedOptionId !== null || answer.numericalAnswer !== null;
        if (attempted) {
            answeredCount += 1;
        }

        if (answer.selectedOptionId === null) {
            row.unattempted += 1;
            unattemptedCount += 1;
        }

        subjectMap.set(subject, row);
    }

    const weakTopicMap: Record<string, number> = {};
    for (const answer of attempt.answers) {
        if (answer.isCorrect !== false) continue;
        const key = answer.question.topic?.name ?? "Unknown";
        weakTopicMap[key] = (weakTopicMap[key] ?? 0) + 1;
    }
    const weakTopics = Object.entries(weakTopicMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));

    const accuracy = answeredCount > 0 ? ((correctCount / answeredCount) * 100).toFixed(1) : null;

    const subjectBreakdown = Array.from(subjectMap.entries())
        .map(([subject, row]) => ({
            subject,
            total: row.total,
            correct: row.correct,
            incorrect: row.incorrect,
            unattempted: row.unattempted,
            marks: row.marks,
            maxPossibleMarks: maxMarksBySubject.get(subject) ?? 0,
        }))
        .filter((subject) => subject.total > 0);

    const questions = attempt.answers
        .map((answer) => {
            const orderIndex = orderByQuestionId.get(answer.questionId) ?? Number.MAX_SAFE_INTEGER;
            const correctOption = answer.question.options.find((opt) => opt.isCorrect);
            const selectedOption = answer.selectedOptionId
                ? answer.question.options.find((opt) => opt.id === answer.selectedOptionId)
                : null;
            const yourAnswer =
                selectedOption?.text ??
                (answer.numericalAnswer != null ? String(answer.numericalAnswer) : "Not Answered");
            const status = answer.isCorrect ? "Correct" : "Incorrect";
            return {
                orderIndex,
                subject: answer.question.subject,
                topic: answer.question.topic?.name ?? null,
                questionText: answer.question.text,
                yourAnswer,
                correctAnswer: correctOption?.text ?? "N/A",
                status,
                marksAwarded: answer.marksAwarded ?? 0,
                explanation: answer.question.explanation ?? null,
            } as const;
        })
        .sort((a, b) => a.orderIndex - b.orderIndex);

    let logoBase64: string | null = null;
    const logoUrl = process.env.LOGO_URL;
    if (logoUrl) {
        try {
            logoBase64 = await fetchLogoBase64(logoUrl);
        } catch {
            logoBase64 = null;
        }
    }

    const pdfData: StudentReportPdfData = {
        examType: attempt.mockTest.batch?.examType ?? "N/A",
        studentName: attempt.student.user.name,
        rollNo: attempt.student.rollNo,
        batchName: attempt.mockTest.batch?.name ?? "N/A",
        testName: attempt.mockTest.name,
        score: attempt.totalScore,
        maxMarks: attempt.mockTest.totalMarks,
        rank: classRank,
        accuracy: accuracy ? `${accuracy}%` : null,
        questionsAttempted: answeredCount,
        durationText: attempt.timeTaken != null ? `${attempt.timeTaken} min` : "N/A",
        percentile: attempt.percentile,
        classAveragePercentile,
        highestPercentile,
        correctCount,
        incorrectCount,
        unattemptedCount,
        weakTopics,
        subjectBreakdown,
        questions,
        generatedOn: formatDateDDMMYYYY(new Date()),
    };

    const pdfBuffer = await renderToBuffer(
        React.createElement(StudentReportPdf, { data: pdfData, logoBase64 }) as unknown as React.ReactElement
    );
    const pdfBytes = new Uint8Array(pdfBuffer);
    const filename = `${sanitizeFilename(attempt.student.user.name)}_${sanitizeFilename(attempt.mockTest.name)}_report.pdf`;

    return { pdfBytes, filename };
}
