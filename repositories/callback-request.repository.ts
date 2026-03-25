import prisma from "@/lib/prisma";
import { NotFoundError } from "@/lib/utils/errors";
import type {
  CallbackStatus,
  CourseMode,
  ExamType,
} from "@prisma/client";

export type CallbackRequestListItem = {
  id: string;
  fullName: string;
  mobileNumber: string;
  courseMode: CourseMode | null;
  examType: ExamType | null;
  status: CallbackStatus;
  adminNote: string | null;
  createdAt: Date;
  calledAt: Date | null;
};

type CallbackRequestSelect = {
  id: string;
  fullName: string;
  mobileNumber: string;
  courseMode: CourseMode | null;
  examType: ExamType | null;
  status: CallbackStatus;
  adminNote: string | null;
  createdAt: Date;
  calledAt: Date | null;
};

function mapToListItem(record: CallbackRequestSelect): CallbackRequestListItem {
  return {
    id: record.id,
    fullName: record.fullName,
    mobileNumber: record.mobileNumber,
    courseMode: record.courseMode,
    examType: record.examType,
    status: record.status,
    adminNote: record.adminNote,
    createdAt: record.createdAt,
    calledAt: record.calledAt,
  };
}

export async function createCallbackRequest(data: {
  fullName: string;
  mobileNumber: string;
  courseMode?: CourseMode | null;
  examType?: ExamType | null;
}): Promise<CallbackRequestListItem> {
  const created = await prisma.callbackRequest.create({
    data: {
      fullName: data.fullName,
      mobileNumber: data.mobileNumber,
      courseMode: data.courseMode ?? undefined,
      examType: data.examType ?? undefined,
    },
    select: {
      id: true,
      fullName: true,
      mobileNumber: true,
      courseMode: true,
      examType: true,
      status: true,
      adminNote: true,
      createdAt: true,
      calledAt: true,
    },
  });

  return mapToListItem(created);
}

export async function findManyCallbackRequests(params: {
  page: number;
  limit: number;
  status?: CallbackStatus;
}): Promise<{ requests: CallbackRequestListItem[]; total: number }> {
  const { page, limit, status } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(status ? { status } : {}),
  };

  const [requests, total] = await Promise.all([
    prisma.callbackRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        mobileNumber: true,
        courseMode: true,
        examType: true,
        status: true,
        adminNote: true,
        createdAt: true,
        calledAt: true,
      },
    }),
    prisma.callbackRequest.count({ where }),
  ]);

  return {
    requests: requests.map(mapToListItem),
    total,
  };
}

export async function findCallbackRequestById(
  id: string
): Promise<CallbackRequestListItem | null> {
  const record = await prisma.callbackRequest.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      mobileNumber: true,
      courseMode: true,
      examType: true,
      status: true,
      adminNote: true,
      createdAt: true,
      calledAt: true,
    },
  });

  return record ? mapToListItem(record) : null;
}

export async function getCallbackRequestByIdOrThrow(
  id: string
): Promise<CallbackRequestListItem> {
  const record = await findCallbackRequestById(id);
  if (!record) {
    throw new NotFoundError("Callback request not found");
  }
  return record;
}

export async function updateCallbackRequestStatus(
  id: string,
  data: {
    status: CallbackStatus;
    adminNote?: string | null;
    calledAt?: Date | null;
  }
): Promise<CallbackRequestListItem> {
  const updated = await prisma.callbackRequest.update({
    where: { id },
    data: {
      status: data.status,
      ...(data.adminNote !== undefined && { adminNote: data.adminNote }),
      ...(data.calledAt !== undefined && { calledAt: data.calledAt }),
    },
    select: {
      id: true,
      fullName: true,
      mobileNumber: true,
      courseMode: true,
      examType: true,
      status: true,
      adminNote: true,
      createdAt: true,
      calledAt: true,
    },
  });

  return mapToListItem(updated);
}

