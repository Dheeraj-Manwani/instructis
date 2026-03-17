import * as mockTestRepository from "@/repositories/mock-test.repository";
import * as batchRepository from "@/repositories/batch.repository";
import * as notificationRepository from "@/repositories/notification.repository";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { AppError } from "@/lib/utils/errors";

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

export async function getTestAttempts(testId: string) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.findTestAttemptsByTestId(testId);
}

export async function updateMockTest(testId: string, data: mockTestRepository.UpdateMockTestInput) {
    await mockTestRepository.getTestByIdOrThrow(testId);
    return mockTestRepository.updateMockTest(testId, data);
}

export async function createOrUpdateTestAttempt(data: mockTestRepository.CreateTestAttemptInput) {
    await mockTestRepository.getTestByIdOrThrow(data.mockTestId);
    return mockTestRepository.createOrUpdateTestAttempt(data);
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
    const testName = attempt.mockTest.name;
    const totalMarks = attempt.mockTest.totalMarks;
    const score = attempt.totalScore ?? 0;
    const percentile = attempt.percentile ?? null;

    const messageLines = [
        `Dear Parent,`,
        ``,
        `Test result for ${studentName} is now available.`,
        `Test: ${testName}`,
        `Score: ${score} / ${totalMarks}`,
    ];

    if (percentile !== null) {
        messageLines.push(`Percentile: ${percentile.toFixed(2)}%`);
    }

    messageLines.push("", "Regards,", "Instructis");

    const body = messageLines.join("\n");

    try {
        await sendWhatsAppMessage(attempt.student.parentPhone, body);
        await notificationRepository.createWhatsAppLog({
            studentId: attempt.studentId,
            parentPhone: attempt.student.parentPhone,
            message: body,
            status: "SENT",
            metadata: {
                mockTestId: attempt.mockTestId,
                testName,
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
                error: error instanceof Error ? error.message : String(error),
            },
        });
        throw new AppError("Failed to send WhatsApp notification", 502);
    }

    return mockTestRepository.markTestAttemptNotified(attemptId);
}