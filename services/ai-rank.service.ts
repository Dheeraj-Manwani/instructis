import type { ExamType } from "@prisma/client";
import * as batchRepository from "@/repositories/batch.repository";
import * as mockTestRepository from "@/repositories/mock-test.repository";
import * as aiRankRepository from "@/repositories/ai-rank.repository";
import * as notificationRepository from "@/repositories/notification.repository";
import { generateRankPrediction } from "@/lib/ai-gemini";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { AppError } from "@/lib/utils/errors";

type AnalyzeInput = {
    batchId: string;
    studentId: string;
};

export async function analyzeStudentPerformance({
    batchId,
    studentId,
}: AnalyzeInput) {
    const batch = await batchRepository.getBatchByIdOrThrow(batchId);
    const studentsInBatch = await batchRepository.findStudentsInBatch(batchId);
    const student = studentsInBatch.find((s) => s.id === studentId);

    if (!student) {
        throw new AppError("Student does not belong to this batch", 400);
    }

    // Get attempts for this student in this batch
    const attempts = await mockTestRepository.findTestAttemptsByStudentInBatch(
        studentId,
        batchId
    );

    if (attempts.length === 0) {
        throw new AppError(
            "No previous mock test attempts found for this student in this batch",
            400
        );
    }

    const history = attempts
        .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
        .map((a) => ({
            testName: a.mockTest.name,
            date: a.startedAt.toISOString().split("T")[0],
            totalScore: a.totalScore,
            percentile: a.percentile,
        }));

    const aiResult = await generateRankPrediction({
        studentName: student.user.name,
        examType: batch.examType as ExamType,
        history,
    });

    // Very rough rank estimate based on percentile and cohort size 100000
    const expectedPercentile = aiResult.nextScoreEstimate.expectedPercentile ?? 0;
    const approximateRank = Math.max(
        1,
        Math.round(((100 - expectedPercentile) / 100) * 100_000)
    );

    const latestPercentile =
        history[history.length - 1]?.percentile ?? expectedPercentile;
    const improvementPts = expectedPercentile - (latestPercentile ?? 0);

    const rankRecord = await aiRankRepository.createRankPrediction({
        studentId,
        examType: batch.examType,
        percentile: expectedPercentile,
        predictedRank: approximateRank,
        targetPercentile: null,
        targetRank: null,
        improvementPts,
    });

    return {
        rankRecord,
        ai: aiResult,
        student: {
            id: student.id,
            rollNo: student.rollNo,
            name: student.user.name,
            email: student.user.email,
        },
        batch,
        history,
    };
}

export async function notifyParentWithPrediction(params: {
    batchId: string;
    studentId: string;
    aiSummary: string;
}) {
    const { batchId, studentId, aiSummary } = params;

    const batch = await batchRepository.getBatchByIdOrThrow(batchId);
    const studentsInBatch = await batchRepository.findStudentsInBatch(batchId);
    const student = studentsInBatch.find((s) => s.id === studentId);

    if (!student) {
        throw new AppError("Student does not belong to this batch", 400);
    }

    const studentFull = await (async () => {
        // We need parent phone/email from Student model
        const prismaStudent = await (await import("@/lib/prisma")).default.student.findUnique(
            {
                where: { id: studentId },
                select: {
                    parentPhone: true,
                    parentName: true,
                },
            }
        );
        return prismaStudent;
    })();

    if (!studentFull?.parentPhone) {
        throw new AppError("Parent phone number is not available for this student", 400);
    }

    const parentName = studentFull.parentName ?? "Parent";
    const studentName = student.user.name;

    const lines = [
        `Dear ${parentName},`,
        ``,
        `Our AI system has analyzed ${studentName}'s recent mock test performance in ${batch.examType}.`,
        ``,
        aiSummary,
        ``,
        `This is an estimate based on past test scores and is meant to guide preparation, not to create pressure.`,
        ``,
        `Regards,`,
        `Instructis`,
    ];

    const body = lines.join("\n");

    try {
        await sendWhatsAppMessage(studentFull.parentPhone, body);
        await notificationRepository.createWhatsAppLog({
            studentId,
            parentPhone: studentFull.parentPhone,
            message: body,
            status: "SENT",
            metadata: {
                type: "RANK_PREDICTION",
                batchId,
            },
        });
    } catch (error) {
        await notificationRepository.createWhatsAppLog({
            studentId,
            parentPhone: studentFull.parentPhone,
            message: body,
            status: "FAILED",
            metadata: {
                type: "RANK_PREDICTION",
                batchId,
                error: error instanceof Error ? error.message : String(error),
            },
        });
        throw new AppError("Failed to send WhatsApp notification", 502);
    }

    return { success: true };
}

