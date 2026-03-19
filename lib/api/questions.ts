import { api } from "./axios";

export type QuestionListItem = {
  id: string;
  text: string;
  type?: string;
  difficulty: string;
  subject: string;
  topicId: string | null;
  topicName: string | null;
  facultyId: string;
  isPublished: boolean;
  createdAt: string;
};

export type QuestionWithOptions = QuestionListItem & {
  explanation: string | null;
  options: { id: string; text: string; isCorrect: boolean; orderIndex: number }[];
};

export type ListQuestionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  difficulty?: string;
  isPublished?: boolean;
  sortBy?: "createdAt" | "subject" | "difficulty";
  sortOrder?: "asc" | "desc";
};

export type ListQuestionsResponse = {
  data: QuestionListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchQuestions(
  params: ListQuestionsParams = {}
): Promise<ListQuestionsResponse> {
  const res = await api.get("/questions", { params }) as {
    data?: QuestionListItem[];
    meta?: ListQuestionsResponse["meta"];
  };
  return {
    data: res.data ?? [],
    meta: res.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}

export async function fetchQuestionById(id: string): Promise<QuestionWithOptions> {
  const res = await api.get(`/questions/${id}`) as { data: QuestionWithOptions };
  return res.data;
}

export type CreateQuestionPayload = {
  text: string;
  type?: string;
  difficulty: string;
  subject: string;
  topicId?: string;
  explanation?: string;
  isPublished: boolean;
  options?: { text: string; isCorrect: boolean; orderIndex: number }[];
};

export async function createQuestion(
  payload: CreateQuestionPayload
): Promise<QuestionWithOptions> {
  const res = await api.post("/questions", payload) as { data: QuestionWithOptions };
  return res.data;
}

export async function updateQuestion(
  id: string,
  payload: Partial<CreateQuestionPayload>
): Promise<QuestionWithOptions> {
  const res = await api.patch(`/questions/${id}`, payload) as {
    data: QuestionWithOptions;
  };
  return res.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await api.delete(`/questions/${id}`);
}
