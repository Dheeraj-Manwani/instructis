import type { ClassStatus, SubjectEnum } from "@prisma/client";
import type { CreateClassBody, UpdateClassBody } from "@/lib/schemas/class.schema";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
};

export type ClassSessionItem = {
  id: string;
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

export async function updateFacultyClass(classId: string, payload: UpdateClassBody) {
  return request<{ classSession: ClassSessionItem; warnings: string[] }>(
    `/api/faculty/classes/${classId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteFacultyClass(classId: string) {
  return request<{ id: string }>(`/api/faculty/classes/${classId}`, {
    method: "DELETE",
  });
}

export async function fetchStudentClasses(tab: "upcoming" | "today" | "past") {
  const query = new URLSearchParams({ tab });
  return request<{ classes: ClassSessionItem[]; tab: "upcoming" | "today" | "past" }>(
    `/api/student/classes?${query.toString()}`
  );
}
