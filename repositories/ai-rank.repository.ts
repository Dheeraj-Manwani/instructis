import { Prisma, type ExamType, type SubjectEnum } from "@prisma/client";
import prisma from "@/lib/prisma";

export type RankPredictionRecord = {
    id: string;
    studentId: string;
    examType: ExamType;
    percentile: number;
    predictedRank: number;
    targetPercentile: number | null;
    targetRank: number | null;
    improvementPts: number;
    predictionJson: Prisma.JsonValue | null;
    createdAt: Date;
};

export async function createRankPrediction(data: {
    studentId: string;
    examType: ExamType;
    percentile: number;
    predictedRank: number;
    targetPercentile?: number | null;
    targetRank?: number | null;
    improvementPts: number;
    predictionJson?: Prisma.InputJsonValue | null;
}): Promise<RankPredictionRecord> {
    const createData: Prisma.RankPredictionUncheckedCreateInput = {
        studentId: data.studentId,
        examType: data.examType,
        percentile: data.percentile,
        predictedRank: data.predictedRank,
        improvementPts: data.improvementPts,
        ...(data.targetPercentile !== undefined && { targetPercentile: data.targetPercentile }),
        ...(data.targetRank !== undefined && { targetRank: data.targetRank }),
        ...(data.predictionJson !== undefined && {
            predictionJson:
                data.predictionJson === null
                    ? Prisma.DbNull
                    : data.predictionJson,
        }),
    };

    const created = await prisma.rankPrediction.create({
        data: createData,
    });

    return created;
}

export type StudentPredictorData = {
    id: string;
    user: { name: string };
    targetExam: ExamType;
    marks: Array<{
        id: string;
        subject: SubjectEnum;
        testName: string;
        examType: ExamType;
        marksObtained: number;
        maxMarks: number;
        percentile: number | null;
        improvement: number | null;
        createdAt: Date;
    }>;
    weakAreas: Array<{
        id: string;
        topicId: string;
        drawbackPoints: number;
        questionsCount: number;
        priority: string;
        topic: {
            id: string;
            name: string;
            subject: SubjectEnum;
        };
    }>;
    rankPredictions: RankPredictionRecord[];
};

export async function getStudentPredictorDataByUserId(
    userId: string
): Promise<StudentPredictorData | null> {
    const student = await prisma.student.findUnique({
        where: { userId },
        select: {
            id: true,
            targetExam: true,
            user: {
                select: {
                    name: true,
                },
            },
            marks: {
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    subject: true,
                    testName: true,
                    examType: true,
                    marksObtained: true,
                    maxMarks: true,
                    percentile: true,
                    improvement: true,
                    createdAt: true,
                },
            },
            weakAreas: {
                orderBy: [{ priority: "asc" }, { drawbackPoints: "desc" }],
                select: {
                    id: true,
                    topicId: true,
                    drawbackPoints: true,
                    questionsCount: true,
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
            rankPredictions: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    return student;
}

export async function getLatestRankPrediction(
    studentId: string,
    examType: ExamType
): Promise<RankPredictionRecord | null> {
    return prisma.rankPrediction.findFirst({
        where: { studentId, examType },
        orderBy: { createdAt: "desc" },
    });
}

