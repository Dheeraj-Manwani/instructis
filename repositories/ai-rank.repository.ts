import type { ExamType } from "@prisma/client";
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
}): Promise<RankPredictionRecord> {
    const created = await prisma.rankPrediction.create({
        data,
    });

    return created;
}

