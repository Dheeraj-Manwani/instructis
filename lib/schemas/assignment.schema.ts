import { z } from "zod";

const subjectEnum = z.enum([
  "PHYSICS",
  "CHEMISTRY",
  "MATHEMATICS",
  "ZOOLOGY",
  "BOTANY",
]);

export const createAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  subject: subjectEnum,
  topicId: z.string().optional(),
  batchId: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  maxMarks: z.number().positive().optional(),
  attachmentUrl: z.string().url().optional(),
});

export const updateAssignmentSchema = createAssignmentSchema
  .partial()
  .extend({
    status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  });

export const submitAssignmentSchema = z.object({
  note: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
});

export const gradeSubmissionSchema = z.object({
  marksAwarded: z.number().min(0),
  feedback: z.string().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;

