import { api } from "./axios";
import type { ExamType } from "@prisma/client";

export type MockTestListItem = {
    id: string;
    name: string;
    batchId: string | null;
    facultyId: string;
    duration: number;
    totalMarks: number;
    isPublished: boolean;
    scheduledAt: string | null;
    createdAt: string;
};

export async function fetchTestsByBatchId(batchId: string): Promise<MockTestListItem[]> {
    const res = (await api.get(`/batches/${batchId}/tests`)) as {
        data: MockTestListItem[];
    };
    return res.data ?? [];
}

export type CreateMockTestPayload = {
    name: string;
    batchId: string | null;
    duration: number;
    totalMarks: number;
    totalMarksPhysics?: number | null;
    totalMarksChemistry?: number | null;
    totalMarksMathematics?: number | null;
    totalMarksZoology?: number | null;
    totalMarksBotany?: number | null;
    isPublished?: boolean;
    scheduledAt?: string | null;
};

export async function createMockTest(payload: CreateMockTestPayload): Promise<MockTestListItem> {
    const res = (await api.post("/tests", payload)) as {
        data: MockTestListItem;
    };
    return res.data;
}

export async function fetchTestById(testId: string): Promise<MockTestListItem & {
    totalMarksPhysics?: number | null;
    totalMarksChemistry?: number | null;
    totalMarksMathematics?: number | null;
    totalMarksZoology?: number | null;
    totalMarksBotany?: number | null;
}> {
    const res = (await api.get(`/tests/${testId}`)) as {
        data: MockTestListItem & {
            totalMarksPhysics?: number | null;
            totalMarksChemistry?: number | null;
            totalMarksMathematics?: number | null;
            totalMarksZoology?: number | null;
            totalMarksBotany?: number | null;
        };
    };
    return res.data;
}

export async function updateMockTest(testId: string, payload: Partial<CreateMockTestPayload>): Promise<MockTestListItem> {
    const res = (await api.patch(`/tests/${testId}`, payload)) as {
        data: MockTestListItem;
    };
    return res.data;
}

export type TestAttemptListItem = {
    id: string;
    studentId: string;
    student: {
        id: string;
        rollNo: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
    startedAt: string;
    submittedAt: string | null;
    physicsMarks: number | null;
    chemistryMarks: number | null;
    mathematicsMarks: number | null;
    zoologyMarks: number | null;
    botanyMarks: number | null;
    totalScore: number | null;
    percentile: number | null;
    timeTaken: number | null;
    isNotified: boolean;
};

export async function fetchTestAttempts(testId: string): Promise<TestAttemptListItem[]> {
    const res = (await api.get(`/tests/${testId}/attempts`)) as {
        data: TestAttemptListItem[];
    };
    return res.data ?? [];
}

export type CreateTestAttemptPayload = {
    studentId: string;
    physicsMarks?: number | null;
    chemistryMarks?: number | null;
    mathematicsMarks?: number | null;
    zoologyMarks?: number | null;
    botanyMarks?: number | null;
    totalScore?: number | null;
    percentile?: number | null;
    submittedAt?: string | null;
};

export async function createTestAttempt(testId: string, payload: CreateTestAttemptPayload): Promise<TestAttemptListItem> {
    const res = (await api.post(`/tests/${testId}/attempts`, payload)) as {
        data: TestAttemptListItem;
    };
    return res.data;
}

export async function notifyTestAttempt(testId: string, attemptId: string): Promise<TestAttemptListItem> {
    const res = (await api.post(`/tests/${testId}/attempts/${attemptId}/notify`)) as {
        data: TestAttemptListItem;
    };
    return res.data;
}

export async function deleteTestAttempts(testId: string, attemptIds: string[]): Promise<{ deletedCount: number }> {
    const res = (await api.delete(`/tests/${testId}/attempts`, {
        data: { attemptIds },
    })) as {
        data: {
            deletedCount: number;
        };
    };
    return res.data;
}

export type TestQuestionListItem = {
    id: string;
    mockTestId: string;
    questionId: string;
    orderIndex: number;
    marks: number;
    negMarks: number;
    question: {
        id: string;
        text: string;
        difficulty: string;
        subject: string;
        topicName: string | null;
    };
};

export type AddTestQuestionPayload = {
    questionId: string;
    marks?: number;
    negMarks?: number;
};

export type UpdateTestQuestionPayload = {
    marks?: number;
    negMarks?: number;
    orderIndex?: number;
};

export async function fetchTestQuestions(testId: string): Promise<TestQuestionListItem[]> {
    const res = (await api.get(`/tests/${testId}/questions`)) as {
        data: TestQuestionListItem[];
    };
    return res.data ?? [];
}

export async function addTestQuestion(testId: string, payload: AddTestQuestionPayload): Promise<TestQuestionListItem> {
    const res = (await api.post(`/tests/${testId}/questions`, payload)) as {
        data: TestQuestionListItem;
    };
    return res.data;
}

export async function updateTestQuestion(
    testId: string,
    testQuestionId: string,
    payload: UpdateTestQuestionPayload
): Promise<TestQuestionListItem> {
    const res = (await api.patch(`/tests/${testId}/questions/${testQuestionId}`, payload)) as {
        data: TestQuestionListItem;
    };
    return res.data;
}

export async function removeTestQuestion(testId: string, testQuestionId: string): Promise<void> {
    await api.delete(`/tests/${testId}/questions/${testQuestionId}`);
}

export type MyTestsBatch = {
    id: string;
    name: string;
    examType: ExamType;
};

export type MyTestAttemptForList = {
    id: string;
    submittedAt: string | null;
    startedAt: string;
    physicsMarks: number | null;
    chemistryMarks: number | null;
    mathematicsMarks: number | null;
    zoologyMarks: number | null;
    botanyMarks: number | null;
    totalScore: number | null;
    percentile: number | null;
    timeTaken: number | null;
};

export type MyTestCard = {
    test: MockTestListItem;
    attempt: MyTestAttemptForList | null;
};

export type MyTestsResponse = {
    batch: MyTestsBatch | null;
    tests: MyTestCard[];
};

export async function fetchMyTests(): Promise<MyTestsResponse> {
    const res = (await api.get("/tests/my-tests")) as { data: MyTestsResponse };
    return res.data;
}

export type TestAttemptAnalysisQuestion = {
    orderIndex: number;
    questionId: string;
    subject: string;
    topicName: string | null;
    questionText: string;
    explanation: string | null;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marksAwarded: number | null;
};

export type TestAttemptAnalysisResponse = {
    attempt: {
        id: string;
        submittedAt: string | null;
        totalScore: number | null;
        percentile: number | null;
    };
    batch: null | { id: string; name: string; examType: ExamType };
    test: {
        id: string;
        name: string;
        duration: number;
        totalMarks: number;
    };
    student: { id: string; name: string; rollNo: string };
    questions: TestAttemptAnalysisQuestion[];
};

export async function fetchTestAttemptAnalysis(
    attemptId: string
): Promise<TestAttemptAnalysisResponse> {
    const res = (await api.get(`/test-attempts/${attemptId}/analysis`)) as {
        data: TestAttemptAnalysisResponse;
    };
    return res.data;
}