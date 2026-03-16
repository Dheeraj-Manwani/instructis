import type { ExamType } from "@prisma/client";
import * as batchRepository from "@/repositories/batch.repository";
import type { PaginationMeta } from "@/types";

export type ListBatchesParams = {
  page: number;
  limit: number;
  examType?: ExamType;
  isActive?: boolean;
  sortBy: "createdAt" | "name" | "year";
  sortOrder: "asc" | "desc";
};

export type ListBatchesResult = {
  data: batchRepository.BatchListItem[];
  meta: PaginationMeta;
};

export async function listBatches(
  params: ListBatchesParams
): Promise<ListBatchesResult> {
  const { batches, total } = await batchRepository.findManyBatches(params);
  const totalPages = Math.ceil(total / params.limit);
  return {
    data: batches,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    },
  };
}

export async function getBatchById(id: string) {
  return batchRepository.getBatchByIdOrThrow(id);
}

export type CreateBatchInput = {
  name: string;
  examType: ExamType;
  year: number;
  isActive: boolean;
};

export async function createBatch(data: CreateBatchInput) {
  return batchRepository.createBatch(data);
}

export type UpdateBatchInput = Partial<CreateBatchInput>;

export async function updateBatch(id: string, data: UpdateBatchInput) {
  return batchRepository.updateBatch(id, data);
}

export async function addStudentsToBatch(batchId: string, studentIds: string[]) {
  await batchRepository.getBatchByIdOrThrow(batchId);
  await batchRepository.addStudentsToBatch(batchId, studentIds);
}

export async function addFacultiesToBatch(batchId: string, facultyIds: string[]) {
  await batchRepository.getBatchByIdOrThrow(batchId);
  await batchRepository.addFacultiesToBatch(batchId, facultyIds);
}

export async function getStudentsNotInBatch(batchId: string) {
  await batchRepository.getBatchByIdOrThrow(batchId);
  return batchRepository.findStudentsNotInBatch(batchId);
}

export async function getFacultiesNotInBatch(batchId: string) {
  await batchRepository.getBatchByIdOrThrow(batchId);
  return batchRepository.findFacultiesNotInBatch(batchId);
}

export async function getBatchesForFaculty(facultyUserId: string) {
  return batchRepository.findBatchesForFaculty(facultyUserId);
}

export async function getStudentsInBatch(batchId: string) {
  await batchRepository.getBatchByIdOrThrow(batchId);
  return batchRepository.findStudentsInBatch(batchId);
}
