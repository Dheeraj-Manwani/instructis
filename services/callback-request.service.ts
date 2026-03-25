import type {
  CallbackStatus,
  CourseMode,
  ExamType,
} from "@prisma/client";
import { CallbackStatus as CallbackStatusEnum } from "@prisma/client";
import type { PaginationMeta } from "@/types";
import * as callbackRequestRepository from "@/repositories/callback-request.repository";

export type CreateCallbackRequestInput = {
  fullName: string;
  mobileNumber: string;
  courseMode: CourseMode;
  examType?: ExamType | null;
};

export async function createCallbackRequest(
  input: CreateCallbackRequestInput
) {
  return callbackRequestRepository.createCallbackRequest(input);
}

export async function listCallbackRequests(params: {
  page: number;
  limit: number;
  status?: CallbackStatus;
}): Promise<{
  data: callbackRequestRepository.CallbackRequestListItem[];
  meta: PaginationMeta;
}> {
  const { requests, total } =
    await callbackRequestRepository.findManyCallbackRequests(params);

  const totalPages = Math.ceil(total / params.limit);
  return {
    data: requests,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    },
  };
}

export type UpdateCallbackRequestStatusInput = {
  status: CallbackStatus;
  adminNote?: string | null;
};

export async function updateCallbackRequestStatus(
  id: string,
  input: UpdateCallbackRequestStatusInput
) {
  const existing =
    await callbackRequestRepository.getCallbackRequestByIdOrThrow(id);

  // `calledAt` is set once when the request becomes CALLED.
  const shouldSetCalledAt =
    input.status === CallbackStatusEnum.CALLED && existing.calledAt == null;
  const calledAtToSet = shouldSetCalledAt ? new Date() : undefined;

  return callbackRequestRepository.updateCallbackRequestStatus(id, {
    status: input.status,
    adminNote: input.adminNote,
    calledAt: calledAtToSet,
  });
}

