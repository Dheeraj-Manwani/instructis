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

const recurringDayOfWeekEnum = z.enum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

const classEditDeleteScopeEnum = z.enum(["THIS_SESSION", "FUTURE_IN_GROUP"]);

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

export const createRecurringClassBodySchema = z
  .object({
    batchId: z.string().min(1),
    subject: subjectEnum,
    title: z.string().min(1).max(200),
    topic: z.string().max(200).optional(),
    description: z.string().max(5000).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    daysOfWeek: z.array(recurringDayOfWeekEnum).min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    meetLink: z.string().url().optional(),
    notes: z.string().max(5000).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) return false;
      const days = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      return days <= 31;
    },
    {
      message: "Date range must be between 1 and 31 days",
      path: ["endDate"],
    }
  );

export const updateClassBodySchema = z
  .object({
    scope: classEditDeleteScopeEnum.optional(),
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

export const classMutationScopeQuerySchema = z.object({
  scope: classEditDeleteScopeEnum.default("THIS_SESSION"),
});

export const studentClassListQuerySchema = z.object({
  tab: z.enum(["upcoming", "today", "past"]).default("upcoming"),
});

export type FacultyClassListQuery = z.infer<typeof facultyClassListQuerySchema>;
export type CreateClassBody = z.infer<typeof createClassBodySchema>;
export type CreateRecurringClassBody = z.infer<typeof createRecurringClassBodySchema>;
export type UpdateClassBody = z.infer<typeof updateClassBodySchema>;
export type ClassEditDeleteScope = z.infer<typeof classEditDeleteScopeEnum>;
export type StudentClassListQuery = z.infer<typeof studentClassListQuerySchema>;
