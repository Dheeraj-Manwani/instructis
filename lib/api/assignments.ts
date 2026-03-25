import { api } from "./axios";
import type {
  CreateAssignmentInput,
  GradeSubmissionInput,
  SubmitAssignmentInput,
  UpdateAssignmentInput,
} from "@/lib/schemas/assignment.schema";

export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
export type SubmissionStatus = "PENDING" | "SUBMITTED" | "LATE" | "GRADED";

export type AssignmentListItem = {
  id: string;
  title: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
  topic: { id: string; name: string } | null;
  batch: { id: string; name: string };
  faculty: { id: string; name: string } | null;
  status: AssignmentStatus;
  dueDate: string | null;
  maxMarks: number | null;
  attachmentUrl: string | null;
  submittedCount: number;
  totalStudents: number;
};

export type AssignmentSubmissionRow = {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: SubmissionStatus;
  note: string | null;
  attachmentUrl: string | null;
  submittedAt: string | null;
  marksAwarded: number | null;
  feedback: string | null;
  gradedAt: string | null;
};

export type AssignmentDetailForFaculty = {
  id: string;
  title: string;
  description: string | null;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
  topic: { id: string; name: string } | null;
  batch: { id: string; name: string };
  faculty: { id: string; name: string };
  status: AssignmentStatus;
  dueDate: string | null;
  maxMarks: number | null;
  attachmentUrl: string | null;
  submissions: AssignmentSubmissionRow[];
};

export type StudentAssignmentListItem = {
  id: string;
  title: string;
  description: string | null;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
  topic: { id: string; name: string } | null;
  batch: { id: string; name: string };
  facultyName: string;
  dueDate: string | null;
  maxMarks: number | null;
  attachmentUrl: string | null;
  assignmentStatus: AssignmentStatus;
  submission: {
    status: SubmissionStatus;
    note: string | null;
    attachmentUrl: string | null;
    submittedAt: string | null;
    marksAwarded: number | null;
    feedback: string | null;
    gradedAt: string | null;
  } | null;
};

export async function fetchAssignments(
  params?: { batchId?: string }
): Promise<AssignmentListItem[] | StudentAssignmentListItem[]> {
  const batchId = params?.batchId;
  const res = (await api.get("/assignments", { params: { ...(batchId ? { batchId } : {}) } })) as {
    data?: Array<unknown>;
  };
  return (res.data ?? []) as AssignmentListItem[] | StudentAssignmentListItem[];
}

export async function fetchAssignmentDetail(
  assignmentId: string
): Promise<AssignmentDetailForFaculty> {
  const res = (await api.get(`/assignments/${assignmentId}`)) as {
    data: AssignmentDetailForFaculty;
  };
  return res.data;
}

export async function createAssignment(
  payload: CreateAssignmentInput
): Promise<unknown> {
  const res = (await api.post("/assignments", payload)) as { data: unknown };
  return res.data;
}

export async function updateAssignment(
  assignmentId: string,
  payload: UpdateAssignmentInput
): Promise<unknown> {
  const res = (await api.patch(`/assignments/${assignmentId}`, payload)) as {
    data: unknown;
  };
  return res.data;
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  await api.delete(`/assignments/${assignmentId}`);
}

export async function submitAssignment(
  assignmentId: string,
  payload: SubmitAssignmentInput
): Promise<unknown> {
  const res = (await api.post(`/assignments/${assignmentId}/submit`, payload)) as {
    data: unknown;
  };
  return res.data;
}

export async function gradeSubmission(
  assignmentId: string,
  studentId: string,
  payload: GradeSubmissionInput
): Promise<unknown> {
  const res = (await api.post(`/assignments/${assignmentId}/grade`, payload, {
    params: { studentId },
  })) as { data: unknown };
  return res.data;
}

export async function uploadAssignmentAttachment(file: File): Promise<{
  objectKey: string;
  url: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = (await api.post("/assignments/upload-attachment", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })) as {
    data: {
      objectKey: string;
      url: string;
    };
  };
  return res.data;
}

