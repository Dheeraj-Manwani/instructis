import { z } from "zod";
import { paginationQuerySchema } from "./common.schema";

export const facultyIdParamSchema = z.object({
  facultyId: z.string().min(1, "Faculty ID is required"),
});

export const facultyListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
});

export const createFacultyBodySchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120),
    email: z.string().trim().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    title: z.string().trim().max(120).optional().nullable(),
    department: z.string().trim().max(120).optional().nullable(),
  })
  .strict();

export const updateFacultyBodySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().optional(),
    facultyCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}\d{3}$/, "Faculty ID must be in format AB203")
      .optional(),
    title: z.string().trim().max(120).optional().nullable(),
    department: z.string().trim().max(120).optional().nullable(),
    newPassword: z.string().min(8).optional(),
    confirmPassword: z.string().optional(),
  })
  .strict();

export type CreateFacultyBody = z.infer<typeof createFacultyBodySchema>;
export type UpdateFacultyBody = z.infer<typeof updateFacultyBodySchema>;
