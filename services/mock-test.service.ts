import * as mockTestRepository from "@/repositories/mock-test.repository";
import * as batchRepository from "@/repositories/batch.repository";
import * as notificationRepository from "@/repositories/notification.repository";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { AppError } from "@/lib/utils/errors";
import { GetBucketLocationCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { generateTestAttemptReportPdf } from "@/services/test-attempt-report.service";
import { getParentNotificationEmailHtml, sendEmail } from "@/lib/email";
import type { Prisma } from "@prisma/client";

const bucketRegionCache = new Map<string, string>();

function toPublicReportUrl(cloudfrontUrl: string, objectKey: string, filename: string) {
    const base = cloudfrontUrl.replace(/\/+$/, "");
    const normalizedBase = base.toLowerCase();
    const baseAlreadyAtReportsPath =
        normalizedBase.endsWith("/instructis/reports") || normalizedBase.endsWith("/instructis/reports/");

    if (baseAlreadyAtReportsPath) {
        return `${base}/${encodeURIComponent(filename)}`;
    }

    const encodedKey = objectKey
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
    return `${base}/${encodedKey}`;
}

async function uploadReportToS3(pdfBytes: Uint8Array, filename: string) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !region || !bucket) {
        throw new AppError("AWS S3 environment variables are not fully configured", 500);
    }

    const s3 = new S3Client({
        region: 'ap-east-1',
        followRegionRedirects: true,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    const objectKey = `instructis/reports/${filename}`;
    await s3.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: objectKey,
            Body: pdfBytes,
            ContentType: "application/pdf",
            ContentDisposition: `inline; filename="${filename}"`,
        })
    );

    return objectKey;
}

export async function getTestsByBatchId(batchId: string) {
    await batchRepository.getBatchByIdOrThrow(batchId);
    return mockTestRepository.findTestsByBatchId(batchId);
}

export async function createMockTest(data: mockTestRepository.CreateMockTestInput) {
    if (data.batchId) {
        await batchRepository.getBatchByIdOrThrow(data.batchId);
    }
    return mockTestRepository.createMockTest(data);
}

export async function getTestById(testId: string) {
    return mockTestRepository.getTestByIdOrThrow(testId);
}

export async function getTestQuestions(testId: string) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.findTestQuestionsByTestId(testId);
}

export async function addQuestionToTest(
    testId: string,
    questionId: string,
    marks?: number,
    negMarks?: number
) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.addQuestionToTest(testId, questionId, marks ?? 4, negMarks ?? 1);
}

export async function updateTestQuestion(
    testId: string,
    testQuestionId: string,
    data: Partial<{ marks: number; negMarks: number; orderIndex: number }>
) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.updateTestQuestion(testId, testQuestionId, data);
}

export async function removeQuestionFromTest(testId: string, testQuestionId: string) {
    return mockTestRepository.removeQuestionFromTest(testId, testQuestionId);
}

export async function reorderTestQuestions(
    testId: string,
    items: Array<{ testQuestionId: string; orderIndex: number }>
) {
    return mockTestRepository.reorderTestQuestions(testId, items);
}

export async function getTestAttempts(testId: string) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.findTestAttemptsByTestId(testId);
}

export async function updateMockTest(testId: string, data: mockTestRepository.UpdateMockTestInput) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.updateMockTest(testId, data);
}

export async function createOrUpdateTestAttempt(
    data: mockTestRepository.CreateTestAttemptInput,
    tx?: Prisma.TransactionClient
) {
    if (!tx) {
        await mockTestRepository.getTestByIdOrThrow(data.mockTestId);
    }
    return mockTestRepository.createOrUpdateTestAttempt(data, tx);
}

export async function deleteTestAttempts(testId: string, attemptIds: string[]) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.deleteTestAttemptsByIds(testId, attemptIds);
}

export async function notifyTestAttemptResult(attemptId: string) {
    const attempt = await mockTestRepository.getTestAttemptWithStudentAndTestOrThrow(attemptId);

    if (attempt.isNotified) {
        throw new AppError("Result already notified for this attempt", 400);
    }

    if (!attempt.student.parentPhone) {
        throw new AppError("Parent phone number is not available for this student", 400);
    }

    const studentName = attempt.student.user?.name ?? "your ward";
    const testName = attempt.mockTest?.name ?? "Practice Test";
    const totalMarks = attempt.mockTest?.totalMarks ?? 0;
    const score = attempt.totalScore ?? 0;
    const percentile = attempt.percentile ?? null;
    const cloudfrontUrl = process.env.CLOUDFRONT_URL;
    if (!cloudfrontUrl) {
        throw new AppError("CLOUDFRONT_URL is not configured", 500);
    }

    const { pdfBytes, filename } = await generateTestAttemptReportPdf(attemptId);
    const objectKey = await uploadReportToS3(pdfBytes, filename);
    const reportUrl = toPublicReportUrl(cloudfrontUrl, objectKey, filename);

    const messageLines = [
        `Dear Parent,`,
        ``,
        `Test result for ${studentName} is now available.`,
        `Test: ${testName}`,
        `Score: ${score} / ${totalMarks}`,
        `Report: ${reportUrl}`,
    ];

    if (percentile !== null) {
        messageLines.push(`Percentile: ${percentile.toFixed(2)}%`);
    }

    messageLines.push("", "Regards,", "Instructis");

    const body = messageLines.join("\n");
    const parentEmail = attempt.student.parentEmail;
    const parentName = attempt.student.parentName ?? "Parent";
    const emailHtml = getParentNotificationEmailHtml({
        title: "Test report is ready",
        greeting: `Dear ${parentName},`,
        lines: [
            `Test result for ${studentName} is now available.`,
            `Test: ${testName}`,
            `Score: ${score} / ${totalMarks}`,
            ...(percentile !== null ? [`Percentile: ${percentile.toFixed(2)}%`] : []),
        ],
        ctaLabel: "View student report",
        ctaUrl: reportUrl,
    });
    const emailSubject = `Instructis: ${studentName}'s ${testName} report`;

    try {
        await sendWhatsAppMessage(attempt.student.parentPhone, body);
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
            studentId: attempt.studentId,
            parentPhone: attempt.student.parentPhone,
            message: body,
            status: "SENT",
            metadata: {
                mockTestId: attempt.mockTestId,
                testName,
                reportUrl,
                reportKey: objectKey,
                parentEmail,
                emailStatus,
                emailError,
            },
        });
    } catch (error) {
        await notificationRepository.createWhatsAppLog({
            studentId: attempt.studentId,
            parentPhone: attempt.student.parentPhone,
            message: body,
            status: "FAILED",
            metadata: {
                mockTestId: attempt.mockTestId,
                testName,
                reportUrl,
                reportKey: objectKey,
                error: error instanceof Error ? error.message : String(error),
            },
        });
        throw new AppError("Failed to send WhatsApp notification", 502);
    }

    return mockTestRepository.markTestAttemptNotified(attemptId);
}