import { z } from "zod";

const subjectEnum = z.enum([
  "PHYSICS",
  "CHEMISTRY",
  "MATHEMATICS",
  "ZOOLOGY",
  "BOTANY",
]);

const classStatusEnum = z.enum([
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const facultyClassListQuerySchema = z.object({
  batchId: z.string().min(1).optional(),
  subject: subjectEnum.optional(),
  weekStart: z.string().datetime().optional(),
});

export const createClassBodySchema = z.object({
  batchId: z.string().min(1),
  subject: subjectEnum,
  title: z.string().min(1).max(200),
  topic: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  meetLink: z.string().url().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateClassBodySchema = z
  .object({
    batchId: z.string().min(1).optional(),
    subject: subjectEnum.optional(),
    title: z.string().min(1).max(200).optional(),
    topic: z.string().max(200).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    date: z.string().datetime().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    meetLink: z.string().url().optional().nullable(),
    notes: z.string().max(5000).optional().nullable(),
    status: classStatusEnum.optional(),
    cancelNote: z.string().max(5000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export const classIdParamSchema = z.object({
  classId: z.string().min(1),
});

export const studentClassListQuerySchema = z.object({
  tab: z.enum(["upcoming", "today", "past"]).default("upcoming"),
});

export type FacultyClassListQuery = z.infer<typeof facultyClassListQuerySchema>;
export type CreateClassBody = z.infer<typeof createClassBodySchema>;
export type UpdateClassBody = z.infer<typeof updateClassBodySchema>;
export type StudentClassListQuery = z.infer<typeof studentClassListQuerySchema>;
