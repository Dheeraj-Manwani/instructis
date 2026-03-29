import { ValidationError } from "@/lib/utils/errors";
import type { PaginationMeta } from "@/types";
import { InstallmentStatus } from "@prisma/client";
import * as paymentRepository from "@/repositories/payment.repository";

export type PaymentStatusFilter = "ALL" | "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";

export type PaymentStudentRow = {
  studentId: string;
  studentName: string;
  studentImage: string | null;
  parentPhone: string | null;
  batchId: string | null;
  batchName: string | null;
  studentFeeId: string | null;
  totalFees: number;
  feesPaid: number;
  dueAmount: number;
  installmentsPaid: number;
  installmentsTotal: number;
  status: Exclude<PaymentStatusFilter, "ALL">;
  discount: number;
  note: string | null;
  installments: paymentRepository.PaymentInstallmentRecord[];
};

function toValidDate(value: string, fieldName: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }
  return parsed;
}

function getStatusForRow(row: PaymentStudentRow): Exclude<PaymentStatusFilter, "ALL"> {
  if (!row.studentFeeId) return "PENDING";

  const hasOverdue = row.installments.some((installment) => installment.status === InstallmentStatus.OVERDUE);
  if (hasOverdue) return "OVERDUE";
  if (row.feesPaid <= 0) return "PENDING";
  if (row.dueAmount <= 0) return "PAID";
  return "PARTIAL";
}

function getActiveStudentFee(student: paymentRepository.PaymentStudentRecord) {
  if (student.studentFees.length === 0) return null;
  if (student.batchId) {
    const matched = student.studentFees.find((fee) => fee.batchId === student.batchId);
    if (matched) return matched;
  }
  return [...student.studentFees].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )[0];
}

export async function listPayments(params: {
  page: number;
  limit: number;
  batchId?: string;
  search?: string;
  status?: PaymentStatusFilter;
}): Promise<{
  data: PaymentStudentRow[];
  batches: { id: string; name: string }[];
  summary: { totalStudents: number; totalCollected: number; totalDue: number };
  meta: PaginationMeta;
}> {
  const [students, batches] = await Promise.all([
    paymentRepository.findPaymentStudents({
      batchId: params.batchId,
      search: params.search,
    }),
    paymentRepository.findAllBatches(),
  ]);

  const normalized: PaymentStudentRow[] = students.map((student) => {
    const activeFee = getActiveStudentFee(student);
    const installments = activeFee?.installments ?? [];
    const installmentsPaid = installments.filter(
      (installment) =>
        installment.status === InstallmentStatus.PAID_FULLY ||
        installment.status === InstallmentStatus.PAID_PARTIALLY
    ).length;
    const feesPaid = installments.reduce((total, installment) => total + installment.paidAmount, 0);
    const totalFees = activeFee ? activeFee.totalAmount : 0;
    const dueAmount = Math.max(totalFees - feesPaid, 0);

    const row: PaymentStudentRow = {
      studentId: student.studentId,
      studentName: student.studentName,
      studentImage: student.studentImage,
      parentPhone: student.parentPhone,
      batchId: student.batchId,
      batchName: student.batchName,
      studentFeeId: activeFee?.id ?? null,
      totalFees,
      feesPaid,
      dueAmount,
      installmentsPaid,
      installmentsTotal: installments.length,
      status: "PENDING",
      discount: activeFee?.discount ?? 0,
      note: activeFee?.note ?? null,
      installments,
    };

    row.status = getStatusForRow(row);
    return row;
  });

  const status = params.status ?? "ALL";
  const filtered =
    status === "ALL" ? normalized : normalized.filter((item) => item.status === status);

  const totalStudents = filtered.length;
  const totalCollected = filtered.reduce((acc, current) => acc + current.feesPaid, 0);
  const totalDue = filtered.reduce((acc, current) => acc + current.dueAmount, 0);

  const skip = (params.page - 1) * params.limit;
  const data = filtered.slice(skip, skip + params.limit);

  return {
    data,
    batches,
    summary: {
      totalStudents,
      totalCollected,
      totalDue,
    },
    meta: {
      total: totalStudents,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(totalStudents / params.limit),
    },
  };
}

export async function setupStudentFee(input: {
  studentId: string;
  batchId: string;
  totalAmount: number;
  discount?: number;
  note?: string | null;
}) {
  const existing = await paymentRepository.findStudentFeeByStudentAndBatch(input.studentId, input.batchId);
  if (existing) {
    throw new ValidationError("Fee structure already exists for this student and batch");
  }
  return paymentRepository.createStudentFee(input);
}

export async function updateStudentFee(
  studentFeeId: string,
  input: {
    totalAmount?: number;
    discount?: number;
  }
) {
  await paymentRepository.getStudentFeeOrThrow(studentFeeId);
  return paymentRepository.updateStudentFee(studentFeeId, input);
}

export async function addInstallment(
  studentFeeId: string,
  input: {
    dueDate: string;
    dueAmount: number;
    paidAmount?: number;
    status: InstallmentStatus;
    paidAt?: string | null;
    remark?: string | null;
  },
  recordedById: string
) {
  await paymentRepository.getStudentFeeOrThrow(studentFeeId);
  return paymentRepository.createInstallment({
    studentFeeId,
    dueDate: toValidDate(input.dueDate, "due date"),
    dueAmount: input.dueAmount,
    paidAmount: input.paidAmount ?? 0,
    status: input.status,
    paidAt: input.paidAt ? toValidDate(input.paidAt, "paid date") : null,
    remark: input.remark ?? null,
    recordedById,
  });
}

export async function updateInstallment(
  installmentId: string,
  input: {
    dueDate?: string;
    dueAmount?: number;
    paidAmount?: number;
    status?: InstallmentStatus;
    paidAt?: string | null;
    remark?: string | null;
  },
  recordedById: string
) {
  await paymentRepository.getInstallmentOrThrow(installmentId);
  return paymentRepository.updateInstallment(installmentId, {
    ...(input.dueDate !== undefined ? { dueDate: toValidDate(input.dueDate, "due date") } : {}),
    ...(input.dueAmount !== undefined ? { dueAmount: input.dueAmount } : {}),
    ...(input.paidAmount !== undefined ? { paidAmount: input.paidAmount } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.paidAt !== undefined
      ? { paidAt: input.paidAt ? toValidDate(input.paidAt, "paid date") : null }
      : {}),
    ...(input.remark !== undefined ? { remark: input.remark } : {}),
    recordedById,
  });
}

export async function deleteInstallment(installmentId: string) {
  await paymentRepository.getInstallmentOrThrow(installmentId);
  await paymentRepository.deleteInstallment(installmentId);
  return { installmentId };
}

export async function getPaymentSummary() {
  const summary = await paymentRepository.getPaymentSummaryAggregates();
  return {
    totalFees: summary.totalFees,
    paidFees: summary.paidFees,
    pendingFees: Math.max(summary.totalFees - summary.paidFees, 0),
    topBatches: summary.topBatches,
  };
}
