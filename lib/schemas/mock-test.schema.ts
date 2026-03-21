import { z } from "zod";
import { ExamType } from "@prisma/client";

export const batchIdParamSchema = z.object({
    id: z.string().min(1, "Batch ID is required"),
});

export const testIdParamSchema = z.object({
    id: z.string().min(1, "Test ID is required"),
});

export const testAttemptIdParamsSchema = z.object({
    id: z.string().min(1, "Test ID is required"),
    attemptId: z.string().min(1, "Attempt ID is required"),
});

export const testQuestionIdParamsSchema = z.object({
    id: z.string().min(1, "Test ID is required"),
    testQuestionId: z.string().min(1, "Test question ID is required"),
});

export const createTestAttemptBodySchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    physicsMarks: z.coerce.number().optional().nullable(),
    chemistryMarks: z.coerce.number().optional().nullable(),
    mathematicsMarks: z.coerce.number().optional().nullable(),
    zoologyMarks: z.coerce.number().optional().nullable(),
    botanyMarks: z.coerce.number().optional().nullable(),
    totalScore: z.coerce.number().optional().nullable(),
    percentile: z.coerce.number().optional().nullable(),
    submittedAt: z.string().datetime().optional().nullable(),
});

export const importGoogleSheetBodySchema = z.object({
    url: z.string().url("A valid Google Sheets URL is required"),
});

export const deleteTestAttemptsBodySchema = z.object({
    attemptIds: z.array(z.string().min(1)).min(1, "At least one attempt ID is required"),
});

export const addTestQuestionBodySchema = z.object({
    questionId: z.string().min(1, "Question ID is required"),
    marks: z.coerce.number().int().min(0).optional(),
    negMarks: z.coerce.number().min(0).optional(),
});

export const updateTestQuestionBodySchema = z.object({
    marks: z.coerce.number().int().min(0).optional(),
    negMarks: z.coerce.number().min(0).optional(),
    orderIndex: z.coerce.number().int().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});

export const reorderTestQuestionsBodySchema = z.object({
    items: z
        .array(
            z.object({
                testQuestionId: z.string().min(1, "Test question ID is required"),
                orderIndex: z.coerce.number().int().min(1, "Order index must be at least 1"),
            })
        )
        .min(1, "At least one reorder item is required"),
});

export const createMockTestBodySchema = z.object({
    name: z.string().min(1, "Test name is required"),
    batchId: z.string().nullable(),
    duration: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
    totalMarks: z.coerce.number().int().min(1, "Total marks must be at least 1"),
    totalMarksPhysics: z.coerce.number().int().min(0).optional().nullable(),
    totalMarksChemistry: z.coerce.number().int().min(0).optional().nullable(),
    totalMarksMathematics: z.coerce.number().int().min(0).optional().nullable(),
    totalMarksZoology: z.coerce.number().int().min(0).optional().nullable(),
    totalMarksBotany: z.coerce.number().int().min(0).optional().nullable(),
    isPublished: z.boolean().default(false),
    scheduledAt: z.string().datetime().optional().nullable(),
});

export const createTestFormSchema = (examType: ExamType | undefined) => {
    const baseSchema = z.object({
        name: z.string().min(1, "Test name is required"),
        duration: z.number().int().min(1, "Duration must be at least 1 minute"),
        totalMarks: z.number().int().min(1, "Total marks must be at least 1"),
        isPublished: z.boolean(),
        scheduledAt: z.string().optional().nullable(),
    });

    if (examType === ExamType.JEE) {
        return baseSchema.extend({
            totalMarksPhysics: z.number().int().min(0, "Physics marks is required"),
            totalMarksChemistry: z.number().int().min(0, "Chemistry marks is required"),
            totalMarksMathematics: z.number().int().min(0, "Mathematics marks is required"),
            totalMarksZoology: z.number().int().min(0).optional().nullable(),
            totalMarksBotany: z.number().int().min(0).optional().nullable(),
        }).refine(
            (data) => {
                const sum = (data.totalMarksPhysics || 0) +
                    (data.totalMarksChemistry || 0) +
                    (data.totalMarksMathematics || 0);
                return data.totalMarks === sum;
            },
            {
                message: "Total marks must equal the sum of Physics, Chemistry, and Mathematics marks",
                path: ["totalMarks"],
            }
        );
    } else if (examType === ExamType.NEET) {
        return baseSchema.extend({
            totalMarksPhysics: z.number().int().min(0, "Physics marks is required"),
            totalMarksChemistry: z.number().int().min(0, "Chemistry marks is required"),
            totalMarksZoology: z.number().int().min(0, "Zoology marks is required"),
            totalMarksBotany: z.number().int().min(0, "Botany marks is required"),
            totalMarksMathematics: z.number().int().min(0).optional().nullable(),
        }).refine(
            (data) => {
                const sum = (data.totalMarksPhysics || 0) +
                    (data.totalMarksChemistry || 0) +
                    (data.totalMarksZoology || 0) +
                    (data.totalMarksBotany || 0);
                return data.totalMarks === sum;
            },
            {
                message: "Total marks must equal the sum of Physics, Chemistry, Zoology, and Botany marks",
                path: ["totalMarks"],
            }
        );
    } else {
        // Fallback schema when exam type is not yet loaded
        return baseSchema.extend({
            totalMarksPhysics: z.number().int().min(0).optional().nullable(),
            totalMarksChemistry: z.number().int().min(0).optional().nullable(),
            totalMarksMathematics: z.number().int().min(0).optional().nullable(),
            totalMarksZoology: z.number().int().min(0).optional().nullable(),
            totalMarksBotany: z.number().int().min(0).optional().nullable(),
        });
    }
};

export type CreateMockTestBody = z.infer<typeof createMockTestBodySchema>;
export type BatchIdParam = z.infer<typeof batchIdParamSchema>;
export type TestIdParam = z.infer<typeof testIdParamSchema>;
export type TestAttemptIdParams = z.infer<typeof testAttemptIdParamsSchema>;
export type TestQuestionIdParams = z.infer<typeof testQuestionIdParamsSchema>;
export type CreateTestAttemptBody = z.infer<typeof createTestAttemptBodySchema>;
export type ImportGoogleSheetBody = z.infer<typeof importGoogleSheetBodySchema>;
export type TestFormValues = z.infer<ReturnType<typeof createTestFormSchema>>;
export type DeleteTestAttemptsBody = z.infer<typeof deleteTestAttemptsBodySchema>;
export type AddTestQuestionBody = z.infer<typeof addTestQuestionBodySchema>;
export type UpdateTestQuestionBody = z.infer<typeof updateTestQuestionBodySchema>;
export type ReorderTestQuestionsBody = z.infer<typeof reorderTestQuestionsBodySchema>;