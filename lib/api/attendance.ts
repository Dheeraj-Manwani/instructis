import { api } from "./axios";
import type {
  CreateClassSessionInput,
  UpdateAttendanceInput,
} from "@/lib/schemas/attendance.schema";

export type FacultySessionListItem = {
  id: string;
  batchId: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
  topic: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  presentCount: number;
  totalCount: number;
};

export type FacultyAttendanceStudent = {
  id: string;
  rollNo: string;
  user: { id: string; name: string; image: string | null };
};

export type AttendanceRowDetail = {
  studentId: string;
  isPresent: boolean;
  note: string | null;
  createdAt: string;
  student: {
    id: string;
    rollNo: string;
    user: { id: string; name: string; image: string | null };
  };
};

export type FacultySessionDetail = {
  id: string;
  batchId: string;
  facultyId: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
  topic: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  createdAt: string;
  batchStudents: FacultyAttendanceStudent[];
  attendances: AttendanceRowDetail[];
};

export type StudentAttendanceSummaryItem = {
  subject: string;
  present: number;
  total: number;
  percentage: number;
};

export type StudentAttendanceSession = {
  id: string;
  date: string;
  subject: string;
  topic: string | null;
  status: "PRESENT" | "ABSENT";
  note: string | null;
};

export type StudentAttendanceResponse = {
  sessions: StudentAttendanceSession[];
  subjectSummary: StudentAttendanceSummaryItem[];
};

export async function fetchSessionsForBatch(
  batchId: string
): Promise<FacultySessionListItem[]> {
  const res = (await api.get("/attendance", { params: { batchId } })) as {
    data?: FacultySessionListItem[];
  };
  return res.data ?? [];
}

export async function fetchSessionDetail(
  sessionId: string
): Promise<FacultySessionDetail> {
  const res = (await api.get(`/attendance/${sessionId}`)) as {
    data: FacultySessionDetail;
  };
  return res.data;
}

export async function createAttendanceSession(
  payload: CreateClassSessionInput
): Promise<{ id: string }> {
  const res = (await api.post("/attendance", payload)) as {
    data: { id: string };
  };
  return res.data;
}

export async function updateAttendance(
  sessionId: string,
  payload: UpdateAttendanceInput
): Promise<unknown> {
  const res = (await api.patch(`/attendance/${sessionId}`, payload)) as {
    data?: unknown;
  };
  return res.data ?? null;
}

export async function fetchStudentAttendance(
  batchId: string
): Promise<StudentAttendanceResponse> {
  const res = (await api.get("/attendance/student", { params: { batchId } })) as {
    data?: StudentAttendanceResponse;
  };
  if (!res.data) throw new Error("Failed to fetch attendance");
  return res.data;
}

