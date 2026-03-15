import { z } from "zod";

const subjectEnum = z.enum([
  "PHYSICS",
  "CHEMISTRY",
  "MATHEMATICS",
  "ZOOLOGY",
  "BOTANY",
]);

export const topicListQuerySchema = z.object({
  subject: subjectEnum,
});

export const createTopicBodySchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  subject: subjectEnum,
});

export const topicFormSchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  subject: subjectEnum,
});

export type TopicListQuery = z.infer<typeof topicListQuerySchema>;
export type CreateTopicBody = z.infer<typeof createTopicBodySchema>;
export type TopicFormValues = z.infer<typeof topicFormSchema>;