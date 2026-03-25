import { z } from "zod";

const subjectEnum = z.enum([
  "PHYSICS",
  "CHEMISTRY",
  "MATHEMATICS",
  "ZOOLOGY",
  "BOTANY",
]);

export const createClassSessionSchema = z.object({
  batchId: z.string().min(1),
  subject: subjectEnum,
  topic: z.string().optional(),
  date: z.string().datetime(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  notes: z.string().optional(),
  // attendance records submitted together with session creation
  attendances: z
    .array(
      z.object({
        studentId: z.string().min(1),
        isPresent: z.boolean(),
        note: z.string().optional(),
      })
    )
    .min(1),
});

export const updateAttendanceSchema = z.object({
  attendances: z
    .array(
      z.object({
        studentId: z.string().min(1),
        isPresent: z.boolean(),
        note: z.string().optional(),
      })
    )
    .min(1),
});

export type CreateClassSessionInput = z.infer<typeof createClassSessionSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;

