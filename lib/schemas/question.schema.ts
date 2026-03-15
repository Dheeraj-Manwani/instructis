import { z } from "zod";

const questionTypeEnum = z.enum(["MCQ", "NUMERICAL", "MULTI_CORRECT"]);
const difficultyEnum = z.enum(["EASY", "MODERATE", "HARD"]);
const subjectEnum = z.enum([
  "PHYSICS",
  "CHEMISTRY",
  "MATHEMATICS",
  "ZOOLOGY",
  "BOTANY",
]);

export const questionIdParamSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
});

export const questionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  subject: subjectEnum.optional(),
  type: questionTypeEnum.optional(),
  difficulty: difficultyEnum.optional(),
  isPublished: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  sortBy: z.enum(["createdAt", "subject", "difficulty", "type"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createQuestionBodySchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: questionTypeEnum.default("MCQ"),
  difficulty: difficultyEnum.default("MODERATE"),
  subject: subjectEnum,
  topicId: z.string().optional(),
  explanation: z.string().optional(),
  isPublished: z.boolean().default(false),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean().default(false),
        orderIndex: z.number().int().min(0),
      })
    )
    .optional(),
});

export const updateQuestionBodySchema = createQuestionBodySchema.partial();

export const questionFormSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  difficulty: difficultyEnum,
  subject: subjectEnum,
  topicId: z.string().optional(),
  explanation: z.string().optional(),
  isPublished: z.boolean(),
  options: z
    .array(
      z.object({ text: z.string().min(1), isCorrect: z.boolean(), orderIndex: z.number() })
    )
    .optional(),
});

export type QuestionIdParam = z.infer<typeof questionIdParamSchema>;
export type QuestionListQuery = z.infer<typeof questionListQuerySchema>;
export type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;
export type UpdateQuestionBody = z.infer<typeof updateQuestionBodySchema>;
export type QuestionFormValues = z.infer<typeof questionFormSchema>;