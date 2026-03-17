import { z } from "zod";

export const aiRankAnalyzeSchema = z.object({
    batchId: z.string().min(1, "Batch is required"),
    studentId: z.string().min(1, "Student is required"),
});

export const aiRankNotifySchema = z.object({
    batchId: z.string().min(1, "Batch is required"),
    studentId: z.string().min(1, "Student is required"),
    aiSummary: z.string().min(1, "AI summary is required"),
});

