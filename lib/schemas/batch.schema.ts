import { z } from "zod";

const examTypeEnum = z.enum(["JEE", "NEET"]);

export const batchIdParamSchema = z.object({
  id: z.string().min(1, "Batch ID is required"),
});

export const batchListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  examType: examTypeEnum.optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  sortBy: z.enum(["createdAt", "name", "year"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createBatchBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  examType: examTypeEnum,
  year: z.coerce.number().int().min(2000).max(2100),
  isActive: z.boolean().default(true),
});

export const updateBatchBodySchema = createBatchBodySchema.partial();

export const batchFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  examType: examTypeEnum,
  year: z.number().int().min(2000).max(2100),
  isActive: z.boolean(),
});

export const addStudentsToBatchSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1, "At least one student is required"),
});

export const addFacultiesToBatchSchema = z.object({
  facultyIds: z.array(z.string().min(1)).min(1, "At least one faculty is required"),
});

export type BatchIdParam = z.infer<typeof batchIdParamSchema>;
export type BatchListQuery = z.infer<typeof batchListQuerySchema>;
export type CreateBatchBody = z.infer<typeof createBatchBodySchema>;
export type UpdateBatchBody = z.infer<typeof updateBatchBodySchema>;
export type BatchFormValues = z.infer<typeof batchFormSchema>;
export type AddStudentsToBatchBody = z.infer<typeof addStudentsToBatchSchema>;
export type AddFacultiesToBatchBody = z.infer<typeof addFacultiesToBatchSchema>;