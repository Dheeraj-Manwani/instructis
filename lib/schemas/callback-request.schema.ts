import { z } from "zod";
import { CallbackStatus, CourseMode, ExamType } from "@prisma/client";
import { paginationQuerySchema } from "./common.schema";

export const callbackRequestIdParamSchema = z.object({
  id: z.string().min(1, "Request ID is required"),
});

export const createCallbackRequestBodySchema = z
  .object({
    fullName: z.string().min(2, "Full name is required").max(200),
    mobileNumber: z
      .string()
      .min(10, "Mobile number is required")
      .max(15, "Mobile number is too long")
      .regex(/^[0-9]+$/, "Mobile number must contain digits only"),
    courseMode: z.nativeEnum(CourseMode),
    examType: z.nativeEnum(ExamType).optional(),
  })
  .strict();

export const callbackRequestListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(CallbackStatus).optional(),
});

export const updateCallbackRequestStatusBodySchema = z
  .object({
    status: z.nativeEnum(CallbackStatus),
    adminNote: z
      .string()
      .max(1000, "Admin note is too long")
      .nullable()
      .optional(),
  })
  .strict();

export type CreateCallbackRequestBody = z.infer<
  typeof createCallbackRequestBodySchema
>;
export type UpdateCallbackRequestStatusBody = z.infer<
  typeof updateCallbackRequestStatusBodySchema
>;

