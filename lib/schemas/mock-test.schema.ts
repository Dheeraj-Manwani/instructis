import { z } from "zod";
import { ExamType } from "@prisma/client";

export const batchIdParamSchema = z.object({
    id: z.string().min(1, "Batch ID is required"),
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
export type TestFormValues = z.infer<ReturnType<typeof createTestFormSchema>>;