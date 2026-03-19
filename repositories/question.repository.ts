import type { Difficulty, Prisma, QuestionType, SubjectEnum } from "@prisma/client";
import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";

export type QuestionListItem = {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  subject: SubjectEnum;
  topicId: string | null;
  topicName: string | null;
  facultyId: string;
  isPublished: boolean;
  createdAt: Date;
};

export type QuestionWithOptions = QuestionListItem & {
  explanation: string | null;
  options: { id: string; text: string; isCorrect: boolean; orderIndex: number }[];
};

type ListParams = {
  page: number;
  limit: number;
  search?: string;
  subject?: SubjectEnum;
  type?: QuestionType;
  difficulty?: Difficulty;
  isPublished?: boolean;
  sortBy: "createdAt" | "subject" | "difficulty" | "type";
  sortOrder: "asc" | "desc";
  facultyId?: string; // when provided, filter by faculty (for FACULTY role)
};

export async function findManyQuestions(
  params: ListParams
): Promise<{ questions: QuestionListItem[]; total: number }> {
  const {
    page,
    limit,
    search,
    subject,
    type,
    difficulty,
    isPublished,
    sortBy,
    sortOrder,
    facultyId,
  } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.QuestionWhereInput = {};
  if (search?.trim()) {
    where.text = { contains: search.trim(), mode: "insensitive" };
  }
  if (subject) where.subject = subject;
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (typeof isPublished === "boolean") where.isPublished = isPublished;

  const orderBy = { [sortBy]: sortOrder } as const;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        topic: { select: { name: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);

  const list: QuestionListItem[] = questions.map((q) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    difficulty: q.difficulty,
    subject: q.subject,
    topicId: q.topicId,
    topicName: q.topic?.name ?? null,
    facultyId: q.facultyId,
    isPublished: q.isPublished,
    createdAt: q.createdAt,
  }));

  return { questions: list, total };
}

export async function findQuestionById(
  id: string
): Promise<QuestionWithOptions | null> {
  const q = await prisma.question.findUnique({
    where: { id },
    include: {
      topic: { select: { name: true } },
      options: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!q) return null;
  return {
    id: q.id,
    text: q.text,
    type: q.type,
    difficulty: q.difficulty,
    subject: q.subject,
    topicId: q.topicId,
    topicName: q.topic?.name ?? null,
    facultyId: q.facultyId,
    isPublished: q.isPublished,
    createdAt: q.createdAt,
    explanation: q.explanation,
    options: q.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
      orderIndex: o.orderIndex,
    })),
  };
}

export async function getQuestionByIdOrThrow(
  id: string
): Promise<QuestionWithOptions> {
  const q = await findQuestionById(id);
  if (!q) throw new NotFoundError("Question not found");
  return q;
}

type CreateData = {
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  subject: SubjectEnum;
  topicId?: string;
  explanation?: string;
  isPublished: boolean;
  facultyId: string;
  options?: { text: string; isCorrect: boolean; orderIndex: number }[];
};

export async function createQuestion(data: CreateData): Promise<QuestionWithOptions> {
  const { options, ...rest } = data;
  const question = await prisma.question.create({
    data: {
      ...rest,
      options:
        options?.length ?
          {
            create: options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              orderIndex: o.orderIndex,
            })),
          }
          : undefined,
    },
    include: {
      topic: { select: { name: true } },
      options: { orderBy: { orderIndex: "asc" } },
    },
  });
  return {
    id: question.id,
    text: question.text,
    type: question.type,
    difficulty: question.difficulty,
    subject: question.subject,
    topicId: question.topicId,
    topicName: question.topic?.name ?? null,
    facultyId: question.facultyId,
    isPublished: question.isPublished,
    createdAt: question.createdAt,
    explanation: question.explanation,
    options: question.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
      orderIndex: o.orderIndex,
    })),
  };
}

type UpdateData = Partial<{
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  subject: SubjectEnum;
  topicId: string | null;
  explanation: string | null;
  isPublished: boolean;
  options: { text: string; isCorrect: boolean; orderIndex: number }[];
}>;

export async function updateQuestion(
  id: string,
  data: UpdateData
): Promise<QuestionWithOptions> {
  const { options, ...rest } = data;
  if (options !== undefined) {
    await prisma.questionOption.deleteMany({ where: { questionId: id } });
  }
  const question = await prisma.question.update({
    where: { id },
    data: {
      ...rest,
      ...(options?.length
        ? {
          options: {
            create: options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              orderIndex: o.orderIndex,
            })),
          },
        }
        : {}),
    },
    include: {
      topic: { select: { name: true } },
      options: { orderBy: { orderIndex: "asc" } },
    },
  });
  return {
    id: question.id,
    text: question.text,
    type: question.type,
    difficulty: question.difficulty,
    subject: question.subject,
    topicId: question.topicId,
    topicName: question.topic?.name ?? null,
    facultyId: question.facultyId,
    isPublished: question.isPublished,
    createdAt: question.createdAt,
    explanation: question.explanation,
    options: question.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
      orderIndex: o.orderIndex,
    })),
  };
}

export async function deleteQuestion(id: string): Promise<void> {
  await prisma.question.delete({ where: { id } });
}

/**
 * Returns true if the question is used in any test (mock test definition or student answers).
 */
export async function isQuestionUsedInTests(id: string): Promise<boolean> {
  const [mockTestQuestionCount, studentAnswerCount] = await Promise.all([
    prisma.mockTestQuestion.count({ where: { questionId: id } }),
    prisma.studentAnswer.count({ where: { questionId: id } }),
  ]);
  return mockTestQuestionCount > 0 || studentAnswerCount > 0;
}
