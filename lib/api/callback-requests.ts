import { api } from "./axios";
import type { CallbackStatus, CourseMode, ExamType } from "@prisma/client";

export type CallbackRequestListItem = {
  id: string;
  fullName: string;
  mobileNumber: string;
  courseMode: CourseMode | null;
  examType: ExamType | null;
  status: CallbackStatus;
  adminNote: string | null;
  createdAt: string;
  calledAt: string | null;
};

export type ListCallbackRequestsParams = {
  page?: number;
  limit?: number;
  status?: CallbackStatus;
};

export type ListCallbackRequestsResponse = {
  data: CallbackRequestListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchCallbackRequests(
  params: ListCallbackRequestsParams = {}
): Promise<ListCallbackRequestsResponse> {
  const { page = 1, limit = 10, status } = params;

  const res = (await api.get("/callback-requests", {
    params: { page, limit, ...(status ? { status } : {}) },
  })) as {
    data?: CallbackRequestListItem[];
    meta?: ListCallbackRequestsResponse["meta"];
  };

  return {
    data: res.data ?? [],
    meta: res.meta ?? {
      total: 0,
      page,
      limit,
      totalPages: 0,
    },
  };
}

export type CreateCallbackRequestPayload = {
  fullName: string;
  mobileNumber: string;
  courseMode: CourseMode;
  examType?: ExamType;
};

export async function createCallbackRequest(
  payload: CreateCallbackRequestPayload
): Promise<CallbackRequestListItem> {
  const res = (await api.post("/callback-requests", payload)) as {
    data: CallbackRequestListItem;
  };
  return res.data;
}

export type UpdateCallbackRequestStatusPayload = {
  status: CallbackStatus;
  adminNote?: string | null;
};

export async function updateCallbackRequestStatus(
  id: string,
  payload: UpdateCallbackRequestStatusPayload
): Promise<CallbackRequestListItem> {
  const res = (await api.patch(`/callback-requests/${id}`, payload)) as {
    data: CallbackRequestListItem;
  };
  return res.data;
}

