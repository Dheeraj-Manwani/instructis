import { InstallmentStatus } from "@prisma/client";
import { api } from "./axios";

export type PaymentRow = {
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
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  discount: number;
  note: string | null;
  installments: {
    id: string;
    dueDate: string;
    dueAmount: number;
    paidAmount: number;
    status: InstallmentStatus;
    paidAt: string | null;
    recordedById: string | null;
    recordedByName: string | null;
    remark: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function fetchPayments(params: {
  page?: number;
  limit?: number;
  batchId?: string;
  status?: "ALL" | "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  search?: string;
}) {
  const res = (await api.get("/api/admin/payments", { params })) as {
    data?: {
      data?: PaymentRow[];
      batches?: { id: string; name: string }[];
      summary?: {
        totalStudents: number;
        totalCollected: number;
        totalDue: number;
      };
    };
    meta?: Meta;
  };

  return {
    data: res.data?.data ?? [],
    batches: res.data?.batches ?? [],
    summary: res.data?.summary ?? {
      totalStudents: 0,
      totalCollected: 0,
      totalDue: 0,
    },
    meta: res.meta ?? {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  };
}

export async function fetchPaymentSummary() {
  const res = (await api.get("/api/admin/payments/summary")) as {
    data: {
      totalFees: number;
      paidFees: number;
      pendingFees: number;
      topBatches: { batchId: string; batchName: string; paidAmount: number }[];
    };
  };
  return res.data;
}

export async function setupStudentFee(payload: {
  studentId: string;
  batchId: string;
  totalAmount: number;
  discount?: number;
  note?: string;
}) {
  const res = (await api.post("/api/admin/payments/setup", payload)) as {
    data: {
      id: string;
    };
  };
  return res.data;
}

export async function updateStudentFee(
  studentFeeId: string,
  payload: { totalAmount?: number; discount?: number }
) {
  const res = (await api.patch(`/api/admin/payments/${studentFeeId}`, payload)) as {
    data: unknown;
  };
  return res.data;
}

export async function addInstallment(
  studentFeeId: string,
  payload: {
    dueDate: string;
    dueAmount: number;
    paidAmount?: number;
    status: InstallmentStatus;
    paidAt?: string | null;
    remark?: string | null;
  }
) {
  const res = (await api.post(`/api/admin/payments/${studentFeeId}/installments`, payload)) as {
    data: unknown;
  };
  return res.data;
}

export async function updateInstallment(
  installmentId: string,
  payload: {
    dueDate?: string;
    dueAmount?: number;
    paidAmount?: number;
    status?: InstallmentStatus;
    paidAt?: string | null;
    remark?: string | null;
  }
) {
  const res = (await api.patch(`/api/admin/payments/installments/${installmentId}`, payload)) as {
    data: unknown;
  };
  return res.data;
}

export async function deleteInstallment(installmentId: string) {
  const res = (await api.delete(`/api/admin/payments/installments/${installmentId}`)) as {
    data: unknown;
  };
  return res.data;
}
