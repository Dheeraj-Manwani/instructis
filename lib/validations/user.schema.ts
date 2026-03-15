import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
