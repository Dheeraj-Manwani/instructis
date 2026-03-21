import type { ExamType } from "@prisma/client";
import * as batchRepository from "@/repositories/batch.repository";
import * as mockTestRepository from "@/repositories/mock-test.repository";
import * as aiRankRepository from "@/repositories/ai-rank.repository";
import * as notificationRepository from "@/repositories/notification.repository";
import { generateRankPrediction } from "@/lib/ai-gemini";
import { generateStudentRankPrediction } from "@/lib/ai-gemini";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { AppError } from "@/lib/utils/errors";
import type { Prisma } from "@prisma/client";
import { getParentNotificationEmailHtml, sendEmail } from "@/lib/email";

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
                    parentEmail: true,
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
    const parentEmail = studentFull.parentEmail;
    const emailHtml = getParentNotificationEmailHtml({
        title: "AI performance prediction update",
        greeting: `Dear ${parentName},`,
        lines: [
            `Our AI system has analyzed ${studentName}'s recent mock test performance in ${batch.examType}.`,
            aiSummary,
            "This is an estimate based on past test scores and is meant to guide preparation, not to create pressure.",
        ],
    });
    const emailSubject = `Instructis: AI prediction update for ${studentName}`;

    try {
        await sendWhatsAppMessage(studentFull.parentPhone, body);
        let emailStatus: "SENT" | "SKIPPED" | "FAILED" = "SKIPPED";
        let emailError: string | null = null;
        if (parentEmail) {
            try {
                await sendEmail({
                    to: parentEmail,
                    subject: emailSubject,
                    html: emailHtml,
                });
                emailStatus = "SENT";
            } catch (error) {
                emailStatus = "FAILED";
                emailError = error instanceof Error ? error.message : String(error);
            }
        }
        await notificationRepository.createWhatsAppLog({
            studentId,
            parentPhone: studentFull.parentPhone,
            message: body,
            status: "SENT",
            metadata: {
                type: "RANK_PREDICTION",
                batchId,
                parentEmail,
                emailStatus,
                emailError,
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

type ExamPredictionView = {
    latestPercentile: number | null;
    predictedRank: number | null;
    percentile95To99Rank: string | null;
    percentile90To95Rank: string | null;
};

type StudentRankPredictorResponse = {
    examType: "JEE" | "NEET";
    availableExamTypes: Array<"JEE" | "NEET">;
    latestTotalMarks: number | null;
    latestImprovement: number | null;
    currentPercentile: number | null;
    currentPredictedRank: number | null;
    performanceTrend: Array<{
        testDate: string;
        marks: number;
        percentile: number | null;
    }>;
    weakAreas: Array<{
        id: string;
        topicId: string;
        topicName: string;
        subject: string;
        drawbackPoints: number;
        priority: string;
        questionsToPractice: number;
        recommendation: {
            studyFocus: string;
            practiceQuestionCount: number;
            resourceTypeSuggestion: string;
        } | null;
    }>;
    ai: {
        predictedRankRange: { JEE: string | null; NEET: string | null };
        targetPercentileNeeded: { top1000: number; top3000: number };
        percentileBandRankEstimate: { p95To99: string; p90To95: string };
        improvementPointsForNextBand: string[];
        overallImprovementTip: string;
        recommendationCards: {
            practice: string;
            videoOrRevision: string;
            formulaRevision: string;
        };
        trendStatus: "improving" | "stagnant" | "declining";
    } | null;
    examPredictions: {
        JEE: ExamPredictionView;
        NEET: ExamPredictionView;
    };
    lastUpdatedAt: string | null;
};

function toExamTypeLabel(examType: ExamType): "JEE" | "NEET" {
    return examType === "NEET" ? "NEET" : "JEE";
}

function safeRankEstimate(input: number | null): number {
    const percentile = input ?? 0;
    return Math.max(1, Math.round(((100 - percentile) / 100) * 100_000));
}

function extractJsonPrediction(
    prediction: aiRankRepository.RankPredictionRecord | null
): Prisma.JsonObject | null {
    if (!prediction?.predictionJson || typeof prediction.predictionJson !== "object") {
        return null;
    }
    return prediction.predictionJson as Prisma.JsonObject;
}

export async function getStudentRankPredictorByUserId(
    userId: string
): Promise<StudentRankPredictorResponse> {
    const studentData = await aiRankRepository.getStudentPredictorDataByUserId(userId);

    if (!studentData) {
        throw new AppError("Student profile not found", 404);
    }

    const allExamTypes = Array.from(new Set(studentData.marks.map((m) => m.examType))).map(
        (examType) => toExamTypeLabel(examType)
    );
    const availableExamTypes: Array<"JEE" | "NEET"> =
        allExamTypes.length > 0 ? allExamTypes : [toExamTypeLabel(studentData.targetExam)];
    const selectedExamType = toExamTypeLabel(studentData.targetExam);

    const marksForSelectedExam = studentData.marks.filter(
        (mark) => toExamTypeLabel(mark.examType) === selectedExamType
    );
    const latestMark = marksForSelectedExam[marksForSelectedExam.length - 1] ?? null;

    const latestPercentileByExam = {
        JEE:
            [...studentData.marks]
                .reverse()
                .find((m) => m.examType === "JEE" && m.percentile != null)?.percentile ?? null,
        NEET:
            [...studentData.marks]
                .reverse()
                .find((m) => m.examType === "NEET" && m.percentile != null)?.percentile ?? null,
    };

    const latestStoredPrediction = await aiRankRepository.getLatestRankPrediction(
        studentData.id,
        studentData.targetExam
    );

    const parsedPredictionJson = extractJsonPrediction(latestStoredPrediction);
    const weakAreaRecs =
        parsedPredictionJson &&
        Array.isArray(parsedPredictionJson.weakAreaRecommendations)
            ? (parsedPredictionJson.weakAreaRecommendations as Array<{
                  topicId: string;
                  studyFocus: string;
                  practiceQuestionCount: number;
                  resourceTypeSuggestion: string;
              }>)
            : [];

    const jeePrediction = await aiRankRepository.getLatestRankPrediction(
        studentData.id,
        "JEE"
    );
    const neetPrediction = await aiRankRepository.getLatestRankPrediction(
        studentData.id,
        "NEET"
    );
    const jeeJson = extractJsonPrediction(jeePrediction);
    const neetJson = extractJsonPrediction(neetPrediction);

    return {
        examType: selectedExamType,
        availableExamTypes,
        latestTotalMarks: latestMark?.marksObtained ?? null,
        latestImprovement: latestMark?.improvement ?? null,
        currentPercentile: latestMark?.percentile ?? null,
        currentPredictedRank: latestStoredPrediction?.predictedRank ?? null,
        performanceTrend: studentData.marks.map((mark) => ({
            testDate: mark.createdAt.toISOString().split("T")[0],
            marks: mark.marksObtained,
            percentile: mark.percentile,
        })),
        weakAreas: studentData.weakAreas.map((wa) => {
            const rec = weakAreaRecs.find((r) => r.topicId === wa.topicId);
            return {
                id: wa.id,
                topicId: wa.topicId,
                topicName: wa.topic.name,
                subject: wa.topic.subject,
                drawbackPoints: wa.drawbackPoints,
                priority: wa.priority,
                questionsToPractice: rec?.practiceQuestionCount ?? wa.questionsCount ?? 0,
                recommendation: rec
                    ? {
                          studyFocus: rec.studyFocus,
                          practiceQuestionCount: rec.practiceQuestionCount,
                          resourceTypeSuggestion: rec.resourceTypeSuggestion,
                      }
                    : null,
            };
        }),
        ai: parsedPredictionJson
            ? {
                  predictedRankRange: {
                      JEE:
                          (parsedPredictionJson.predictedRankRange as { JEE?: string | null })
                              ?.JEE ?? null,
                      NEET:
                          (parsedPredictionJson.predictedRankRange as { NEET?: string | null })
                              ?.NEET ?? null,
                  },
                  targetPercentileNeeded: {
                      top1000:
                          (parsedPredictionJson.targetPercentileNeeded as { top1000?: number })
                              ?.top1000 ?? 98.5,
                      top3000:
                          (parsedPredictionJson.targetPercentileNeeded as { top3000?: number })
                              ?.top3000 ?? 96.0,
                  },
                  percentileBandRankEstimate: {
                      p95To99:
                          (parsedPredictionJson.percentileBandRankEstimate as { p95To99?: string })
                              ?.p95To99 ?? "N/A",
                      p90To95:
                          (parsedPredictionJson.percentileBandRankEstimate as { p90To95?: string })
                              ?.p90To95 ?? "N/A",
                  },
                  improvementPointsForNextBand: Array.isArray(
                      parsedPredictionJson.improvementPointsForNextBand
                  )
                      ? (parsedPredictionJson.improvementPointsForNextBand as string[])
                      : [],
                  overallImprovementTip:
                      (parsedPredictionJson.overallImprovementTip as string) ??
                      "Complete more tests to generate personalized tips.",
                  recommendationCards:
                      {
                          practice:
                              (parsedPredictionJson.recommendationCards as { practice?: string })
                                  ?.practice ?? "Practice weak topics daily.",
                          videoOrRevision:
                              (
                                  parsedPredictionJson.recommendationCards as {
                                      videoOrRevision?: string;
                                  }
                              )?.videoOrRevision ?? "Watch one focused revision video.",
                          formulaRevision:
                              (
                                  parsedPredictionJson.recommendationCards as {
                                      formulaRevision?: string;
                                  }
                              )?.formulaRevision ?? "Revise formulas and short notes.",
                      },
                  trendStatus:
                      (parsedPredictionJson.trendStatus as
                          | "improving"
                          | "stagnant"
                          | "declining") ?? "stagnant",
              }
            : null,
        examPredictions: {
            JEE: {
                latestPercentile: jeePrediction?.percentile ?? latestPercentileByExam.JEE,
                predictedRank: jeePrediction?.predictedRank ?? null,
                percentile95To99Rank:
                    (jeeJson?.percentileBandRankEstimate as { p95To99?: string })?.p95To99 ??
                    null,
                percentile90To95Rank:
                    (jeeJson?.percentileBandRankEstimate as { p90To95?: string })?.p90To95 ??
                    null,
            },
            NEET: {
                latestPercentile: neetPrediction?.percentile ?? latestPercentileByExam.NEET,
                predictedRank: neetPrediction?.predictedRank ?? null,
                percentile95To99Rank:
                    (neetJson?.percentileBandRankEstimate as { p95To99?: string })?.p95To99 ??
                    null,
                percentile90To95Rank:
                    (neetJson?.percentileBandRankEstimate as { p90To95?: string })?.p90To95 ??
                    null,
            },
        },
        lastUpdatedAt: latestStoredPrediction?.createdAt.toISOString() ?? null,
    };
}

export async function refreshStudentRankPredictorByUserId(
    userId: string
): Promise<StudentRankPredictorResponse> {
    const studentData = await aiRankRepository.getStudentPredictorDataByUserId(userId);

    if (!studentData) {
        throw new AppError("Student profile not found", 404);
    }

    if (studentData.marks.length === 0) {
        throw new AppError("Complete at least one test to generate prediction", 400);
    }

    const latestPercentiles = {
        JEE:
            [...studentData.marks]
                .reverse()
                .find((m) => m.examType === "JEE" && m.percentile != null)?.percentile ?? null,
        NEET:
            [...studentData.marks]
                .reverse()
                .find((m) => m.examType === "NEET" && m.percentile != null)?.percentile ?? null,
    };

    const geminiPayload = await generateStudentRankPrediction({
        studentName: studentData.user.name,
        targetExam: toExamTypeLabel(studentData.targetExam),
        latestPercentiles,
        marksHistory: studentData.marks.map((mark) => ({
            testName: mark.testName,
            examType: toExamTypeLabel(mark.examType),
            subject: mark.subject,
            marksObtained: mark.marksObtained,
            maxMarks: mark.maxMarks,
            percentile: mark.percentile,
            improvement: mark.improvement,
            createdAt: mark.createdAt.toISOString(),
        })),
        weakAreas: studentData.weakAreas.map((wa) => ({
            id: wa.topicId,
            topicName: wa.topic.name,
            subject: wa.topic.subject,
            drawbackPoints: wa.drawbackPoints,
            priority: wa.priority,
        })),
        previousPredictions: studentData.rankPredictions.slice(0, 3).map((prediction) => ({
            examType: toExamTypeLabel(prediction.examType),
            percentile: prediction.percentile,
            predictedRank: prediction.predictedRank,
            improvementPts: prediction.improvementPts,
            createdAt: prediction.createdAt.toISOString(),
        })),
    });

    const primaryExamType = studentData.targetExam;
    const latestPrimaryPercentile =
        primaryExamType === "JEE"
            ? latestPercentiles.JEE
            : latestPercentiles.NEET;
    const selectedRange =
        primaryExamType === "JEE"
            ? geminiPayload.predictedRankRange.JEE
            : geminiPayload.predictedRankRange.NEET;
    const predictedRankFromPercentile = safeRankEstimate(latestPrimaryPercentile);
    const predictedRankFromRange = selectedRange
        ? parseInt(selectedRange.split("-")[0].replace(/[^\d]/g, ""), 10)
        : NaN;
    const predictedRank = Number.isNaN(predictedRankFromRange)
        ? predictedRankFromPercentile
        : predictedRankFromRange;

    await aiRankRepository.createRankPrediction({
        studentId: studentData.id,
        examType: primaryExamType,
        percentile: latestPrimaryPercentile ?? 0,
        predictedRank,
        targetPercentile: geminiPayload.targetPercentileNeeded.top1000,
        targetRank: 1000,
        improvementPts: 0,
        predictionJson: geminiPayload as unknown as Prisma.JsonValue,
    });

    return getStudentRankPredictorByUserId(userId);
}

