import { z } from "zod";

export const practiceQuerySchema = z.object({
    topicId: z.string().optional(),
});

export const startPracticeSessionBodySchema = z.object({
    topicId: z.string().optional(),
});

export const submitPracticeAnswerBodySchema = z
    .object({
        attemptId: z.string().min(1, "Attempt ID is required"),
        questionId: z.string().min(1, "Question ID is required"),
        selectedOptionId: z.string().optional(),
        numericalAnswer: z.coerce.number().optional(),
    })
    .refine(
        (data) =>
            typeof data.selectedOptionId === "string" ||
            typeof data.numericalAnswer === "number",
        { message: "Select an option or provide a numerical answer" }
    );

export type PracticeQuery = z.infer<typeof practiceQuerySchema>;
export type StartPracticeSessionBody = z.infer<typeof startPracticeSessionBodySchema>;
export type SubmitPracticeAnswerBody = z.infer<typeof submitPracticeAnswerBodySchema>;
