import { api } from "./axios";

export type PracticeWeakAreaItem = {
    id: string;
    topicId: string;
    topicName: string;
    subject: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    drawbackPoints: number;
    availablePracticeQuestions: number;
};

export type PracticeQuestionItem = {
    id: string;
    topicId: string | null;
    topicName: string | null;
    subject: string;
    type: string;
    text: string;
    explanation: string | null;
    options: Array<{ id: string; text: string; isCorrect: boolean; orderIndex: number }>;
};

export type PracticeScreenResponse = {
    weakAreas: PracticeWeakAreaItem[];
    selectedTopicId: string | null;
    questions: PracticeQuestionItem[];
};

export async function fetchPracticeScreen(topicId?: string): Promise<PracticeScreenResponse> {
    const res = (await api.get("/practice", {
        params: {
            topicId,
        },
    })) as { data: PracticeScreenResponse };
    return res.data;
}

export async function startPracticeSession(topicId?: string): Promise<{ attemptId: string }> {
    const res = (await api.post("/practice/session", { topicId })) as {
        data: { attemptId: string };
    };
    return res.data;
}

export type SubmitPracticeAnswerPayload = {
    attemptId: string;
    questionId: string;
    selectedOptionId?: string;
    numericalAnswer?: number;
};

export type SubmitPracticeAnswerResponse = {
    isCorrect: boolean;
    marksAwarded: number;
    correctOptionId: string | null;
    explanation: string | null;
};

export async function submitPracticeAnswer(
    payload: SubmitPracticeAnswerPayload
): Promise<SubmitPracticeAnswerResponse> {
    const res = (await api.post("/practice/answer", payload)) as {
        data: SubmitPracticeAnswerResponse;
    };
    return res.data;
}
