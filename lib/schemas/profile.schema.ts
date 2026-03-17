import { z } from "zod";
import { ExamType } from "@prisma/client";

export const updateProfileBodySchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200).optional(),
    image: z.string().url().nullable().optional(),
    student: z
      .object({
        rollNo: z.string().min(1).max(50).optional(),
        targetExam: z.nativeEnum(ExamType).optional(),
        batchId: z.string().nullable().optional(),
        parentName: z.string().max(200).nullable().optional(),
        parentPhone: z.string().max(20).nullable().optional(),
        parentEmail: z.string().email().max(200).nullable().optional(),
        address: z.string().max(500).nullable().optional(),
        dob: z.string().nullable().optional(),
      })
      .optional(),
    faculty: z
      .object({
        title: z.string().max(100).nullable().optional(),
        department: z.string().max(100).nullable().optional(),
      })
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.image !== undefined || data.student !== undefined || data.faculty !== undefined, {
    message: "At least one field must be provided",
  });

export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;

/** Form schema for the profile page (all role fields in one flat form). */
export const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  image: z.string().url("Enter a valid URL").nullable().optional().or(z.literal("")),
  // Student
  rollNo: z.string().optional(),
  targetExam: z.enum(["JEE", "NEET"]).optional(),
  parentName: z.string().max(200).nullable().optional(),
  parentPhone: z.string().max(20).nullable().optional(),
  parentEmail: z.string().email().max(200).nullable().optional().or(z.literal("")),
  address: z.string().max(500).nullable().optional(),
  dob: z.string().nullable().optional(),
  // Faculty
  title: z.string().max(100).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
