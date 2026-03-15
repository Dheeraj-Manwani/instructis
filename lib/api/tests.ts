import { api } from "./axios";

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
};

export async function fetchTestAttempts(testId: string): Promise<TestAttemptListItem[]> {
    const res = (await api.get(`/tests/${testId}/attempts`)) as {
        data: TestAttemptListItem[];
    };
    return res.data ?? [];
}