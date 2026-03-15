import { Difficulty, QuestionType, SubjectEnum, RoleEnum } from "@prisma/client";
import { ForbiddenError } from "@/lib/utils/errors";
import * as facultyRepository from "@/repositories/faculty.repository";
import * as questionRepository from "@/repositories/question.repository";
import type { PaginationMeta } from "@/types";

export type ListQuestionsParams = {
  page: number;
  limit: number;
  search?: string;
  subject?: SubjectEnum;
  type?: QuestionType;
  difficulty?: Difficulty;
  isPublished?: boolean;
  sortBy: "createdAt" | "subject" | "difficulty" | "type";
  sortOrder: "asc" | "desc";
  userId: string;
  requestorRole: RoleEnum | string;
};

export type ListQuestionsResult = {
  data: questionRepository.QuestionListItem[];
  meta: PaginationMeta;
};

export async function listQuestions(
  params: ListQuestionsParams
): Promise<ListQuestionsResult> {
  let facultyId: string | undefined;
  if (params.requestorRole === RoleEnum.FACULTY) {
    const id = await facultyRepository.findFacultyIdByUserId(params.userId);
    facultyId = id ?? undefined;
  }
  const { questions, total } = await questionRepository.findManyQuestions({
    page: params.page,
    limit: params.limit,
    search: params.search,
    subject: params.subject,
    type: params.type,
    difficulty: params.difficulty,
    isPublished: params.isPublished,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    facultyId,
  });
  const totalPages = Math.ceil(total / params.limit);
  return {
    data: questions,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    },
  };
}

export async function getQuestionById(
  id: string,
  context: { requestorId: string; requestorRole: RoleEnum | string; facultyId?: string }
) {
  const question = await questionRepository.getQuestionByIdOrThrow(id);
  const isAdmin = context.requestorRole === RoleEnum.ADMIN;
  const isOwn = context.facultyId && question.facultyId === context.facultyId;
  if (!isAdmin && !isOwn) {
    throw new ForbiddenError("You can only access your own questions");
  }
  return question;
}

export type CreateQuestionInput = {
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  subject: SubjectEnum;
  topicId?: string;
  explanation?: string;
  isPublished: boolean;
  options?: { text: string; isCorrect: boolean; orderIndex: number }[];
};

export async function getFacultyIdForUser(userId: string): Promise<string | null> {
  return facultyRepository.findFacultyIdByUserId(userId);
}

export async function createQuestion(
  data: CreateQuestionInput,
  facultyId: string
) {
  return questionRepository.createQuestion({
    ...data,
    facultyId,
  });
}

export type UpdateQuestionInput = Partial<CreateQuestionInput>;

export async function updateQuestion(
  id: string,
  data: UpdateQuestionInput,
  context: { requestorRole: RoleEnum | string; facultyId?: string }
) {
  const existing = await questionRepository.getQuestionByIdOrThrow(id);
  const isAdmin = context.requestorRole === RoleEnum.ADMIN;
  const isOwn = context.facultyId && existing.facultyId === context.facultyId;
  if (!isAdmin && !isOwn) {
    throw new ForbiddenError("You can only edit your own questions");
  }
  return questionRepository.updateQuestion(id, data);
}

export async function deleteQuestion(
  id: string,
  context: { requestorRole: RoleEnum | string; facultyId?: string }
) {
  const existing = await questionRepository.getQuestionByIdOrThrow(id);
  const isAdmin = context.requestorRole === RoleEnum.ADMIN;
  const isOwn = context.facultyId && existing.facultyId === context.facultyId;
  if (!isAdmin && !isOwn) {
    throw new ForbiddenError("You can only delete your own questions");
  }
  await questionRepository.deleteQuestion(id);
}
