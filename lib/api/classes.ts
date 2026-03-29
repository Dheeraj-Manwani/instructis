import type { ClassStatus, SubjectEnum } from "@prisma/client";
import type {
  ClassEditDeleteScope,
  CreateClassBody,
  CreateRecurringClassBody,
  UpdateClassBody,
} from "@/lib/schemas/class.schema";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
};

export type ClassSessionItem = {
  id: string;
  groupId: string | null;
  batchId: string;
  batchName: string;
  facultyId: string;
  facultyName: string;
  subject: SubjectEnum;
  title: string;
  topic: string | null;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  meetLink: string | null;
  status: ClassStatus;
  cancelNote: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FacultyClassesResponse = {
  classes: ClassSessionItem[];
  upcoming: ClassSessionItem[];
  stats: {
    weekTotal: number;
    completed: number;
    cancelled: number;
  };
  week: { start: string; end: string };
  batches: { id: string; name: string }[];
};

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const json = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? "Request failed");
  }
  return json.data;
}

export async function fetchFacultyClasses(params?: {
  batchId?: string;
  subject?: SubjectEnum;
  weekStart?: string;
}) {
  const query = new URLSearchParams();
  if (params?.batchId) query.set("batchId", params.batchId);
  if (params?.subject) query.set("subject", params.subject);
  if (params?.weekStart) query.set("weekStart", params.weekStart);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<FacultyClassesResponse>(`/api/faculty/classes${suffix}`);
}

export async function createFacultyClass(payload: CreateClassBody) {
  return request<{ classSession: ClassSessionItem; warnings: string[] }>("/api/faculty/classes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createFacultyRecurringClasses(payload: CreateRecurringClassBody) {
  return request<{ count: number; groupId: string | null; warnings: string[] }>("/api/faculty/classes/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateFacultyClass(classId: string, payload: UpdateClassBody) {
  return request<{
    classSession: ClassSessionItem | null;
    warnings: string[];
    updatedCount: number;
    scopeApplied: ClassEditDeleteScope;
  }>(
    `/api/faculty/classes/${classId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchFacultyDeleteImpact(classId: string, scope: ClassEditDeleteScope) {
  const query = new URLSearchParams({ scope });
  return request<{ affectedCount: number; scopeApplied: ClassEditDeleteScope }>(
    `/api/faculty/classes/${classId}?${query.toString()}`
  );
}

export async function deleteFacultyClass(classId: string, scope: ClassEditDeleteScope = "THIS_SESSION") {
  const query = new URLSearchParams({ scope });
  return request<{ id: string; deletedCount: number; scopeApplied: ClassEditDeleteScope }>(
    `/api/faculty/classes/${classId}?${query.toString()}`,
    {
    method: "DELETE",
    }
  );
}

export async function fetchStudentClasses(tab: "upcoming" | "today" | "past") {
  const query = new URLSearchParams({ tab });
  return request<{ classes: ClassSessionItem[]; tab: "upcoming" | "today" | "past" }>(
    `/api/student/classes?${query.toString()}`
  );
}
