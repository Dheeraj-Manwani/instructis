import * as mockTestRepository from "@/repositories/mock-test.repository";
import * as batchRepository from "@/repositories/batch.repository";

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