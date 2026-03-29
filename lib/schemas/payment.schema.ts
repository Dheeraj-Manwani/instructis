import { InstallmentStatus } from "@prisma/client";
import { z } from "zod";
import { paginationQuerySchema } from "./common.schema";

export const paymentStatusFilterSchema = z.enum([
  "ALL",
  "PAID",
  "PARTIAL",
  "PENDING",
  "OVERDUE",
]);

export const paymentListQuerySchema = paginationQuerySchema.extend({
  batchId: z.string().trim().optional(),
  status: paymentStatusFilterSchema.optional(),
  search: z.string().trim().optional(),
});

export const setupStudentFeeBodySchema = z
  .object({
    studentId: z.string().min(1, "Student ID is required"),
    batchId: z.string().min(1, "Batch ID is required"),
    totalAmount: z.coerce.number().nonnegative("Total amount must be at least 0"),
    discount: z.coerce.number().nonnegative("Discount must be at least 0").optional(),
    note: z.string().trim().max(500).optional().nullable(),
  })
  .strict();

export const studentFeeIdParamSchema = z.object({
  studentFeeId: z.string().min(1, "Student fee ID is required"),
});

export const installmentIdParamSchema = z.object({
  installmentId: z.string().min(1, "Installment ID is required"),
});

export const updateStudentFeeBodySchema = z
  .object({
    totalAmount: z.coerce.number().nonnegative().optional(),
    discount: z.coerce.number().nonnegative().optional(),
  })
  .strict()
  .refine((value) => value.totalAmount !== undefined || value.discount !== undefined, {
    message: "At least one field is required",
  });

export const createInstallmentBodySchema = z
  .object({
    dueDate: z.string().min(1, "Due date is required"),
    dueAmount: z.coerce.number().nonnegative("Due amount must be at least 0"),
    paidAmount: z.coerce.number().nonnegative("Paid amount must be at least 0").optional(),
    status: z.nativeEnum(InstallmentStatus),
    remark: z.string().trim().max(500).optional().nullable(),
    paidAt: z.string().optional().nullable(),
  })
  .strict();

export const updateInstallmentBodySchema = z
  .object({
    dueDate: z.string().optional(),
    dueAmount: z.coerce.number().nonnegative().optional(),
    paidAmount: z.coerce.number().nonnegative().optional(),
    status: z.nativeEnum(InstallmentStatus).optional(),
    paidAt: z.string().optional().nullable(),
    remark: z.string().trim().max(500).optional().nullable(),
  })
  .strict()
  .refine(
    (value) =>
      value.dueDate !== undefined ||
      value.dueAmount !== undefined ||
      value.paidAmount !== undefined ||
      value.status !== undefined ||
      value.paidAt !== undefined ||
      value.remark !== undefined,
    { message: "At least one field is required" }
  );
