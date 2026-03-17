import { api } from "./axios";

export type BatchListItem = {
  id: string;
  name: string;
  examType: string;
  year: number;
  isActive: boolean;
  createdAt: string;
};

export type ListBatchesParams = {
  page?: number;
  limit?: number;
  examType?: string;
  isActive?: boolean;
  sortBy?: "createdAt" | "name" | "year";
  sortOrder?: "asc" | "desc";
};

export type ListBatchesResponse = {
  data: BatchListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchBatches(
  params: ListBatchesParams = {}
): Promise<ListBatchesResponse> {
  const res = (await api.get("/batches", { params })) as {
    data?: BatchListItem[];
    meta?: ListBatchesResponse["meta"];
  };
  return {
    data: res.data ?? [],
    meta: res.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}

export async function fetchBatchById(id: string): Promise<BatchListItem> {
  const res = (await api.get(`/batches/${id}`)) as { data: BatchListItem };
  return res.data;
}

export async function downloadStudentFacultyTemplate(): Promise<string> {
  const res = (await api.get("/batches/student-faculty-template")) as {
    data: { url: string };
  };
  return res.data.url;
}

export type CreateBatchPayload = {
  name: string;
  examType: string;
  year: number;
  isActive?: boolean;
};

export async function createBatch(
  payload: CreateBatchPayload
): Promise<BatchListItem> {
  const res = (await api.post("/batches", payload)) as { data: BatchListItem };
  return res.data;
}

export async function updateBatch(
  id: string,
  payload: Partial<CreateBatchPayload>
): Promise<BatchListItem> {
  const res = (await api.patch(`/batches/${id}`, payload)) as {
    data: BatchListItem;
  };
  return res.data;
}

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function fetchStudentsNotInBatch(
  batchId: string
): Promise<UserListItem[]> {
  const res = (await api.get(`/batches/${batchId}/students`)) as {
    data: UserListItem[];
  };
  return res.data ?? [];
}

export async function fetchFacultiesNotInBatch(
  batchId: string
): Promise<UserListItem[]> {
  const res = (await api.get(`/batches/${batchId}/faculties`)) as {
    data: UserListItem[];
  };
  return res.data ?? [];
}

export async function addStudentsToBatch(
  batchId: string,
  studentIds: string[]
): Promise<void> {
  await api.post(`/batches/${batchId}/students`, { studentIds });
}

export async function addFacultiesToBatch(
  batchId: string,
  facultyIds: string[]
): Promise<void> {
  await api.post(`/batches/${batchId}/faculties`, { facultyIds });
}

export type FacultyInBatch = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export async function fetchMyBatches(): Promise<BatchListItem[]> {
  const res = (await api.get("/batches/my-batches")) as {
    data: BatchListItem[];
  };
  return res.data ?? [];
}

export type StudentInBatch = {
  id: string;
  rollNo: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export async function fetchStudentsInBatch(batchId: string): Promise<StudentInBatch[]> {
  const res = (await api.get(`/batches/${batchId}/students-list`)) as {
    data: StudentInBatch[];
  };
  return res.data ?? [];
}

export async function fetchFacultiesInBatch(
  batchId: string
): Promise<FacultyInBatch[]> {
  const res = (await api.get(`/batches/${batchId}/faculties-list`)) as {
    data: FacultyInBatch[];
  };
  return res.data ?? [];
}

export type BulkImportResult = {
  studentsImported: number;
  facultyImported: number;
};

export type BulkImportErrorDetail = {
  row: number;
  field: string;
  reason: string;
};

export async function bulkImportStudentsAndFaculty(
  file: File,
  batchId?: string
): Promise<BulkImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (batchId) {
    formData.append("batchId", batchId);
  }

  const res = (await api.post("/batches/bulk-import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })) as { data: BulkImportResult };

  return res.data;
}
