import { NotFoundError } from "@/lib/utils/errors";
import * as practiceRepository from "@/repositories/practice.repository";

export async function getPracticeScreenData(userId: string, topicId?: string) {
    return practiceRepository.getPracticeDataForStudent(userId, topicId);
}

export async function startPracticeSession(userId: string, topicId?: string) {
    const studentId = await practiceRepository.findStudentIdByUserId(userId);
    if (!studentId) {
        throw new NotFoundError("Student profile not found");
    }
    return practiceRepository.createPracticeAttempt(studentId, topicId);
}

export async function submitPracticeAnswer(
    userId: string,
    input: {
        attemptId: string;
        questionId: string;
        selectedOptionId?: string;
        numericalAnswer?: number;
    }
) {
    return practiceRepository.submitPracticeAnswer({ ...input, userId });
}
