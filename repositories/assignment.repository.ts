import prisma from "@/lib/prisma";
import type { SubjectEnum } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";
import type {
  CreateAssignmentInput,
  GradeSubmissionInput,
  SubmitAssignmentInput,
  UpdateAssignmentInput,
} from "@/lib/schemas/assignment.schema";
import type { AssignmentStatus, SubmissionStatus } from "@prisma/client";

export type AssignmentSubmittedCount = {
  submittedCount: number;
  totalStudents: number;
};

export type AssignmentListItem = {
  id: string;
  title: string;
  subject: SubjectEnum;
  topic: { id: string; name: string } | null;
  batch: { id: string; name: string };
  faculty: { id: string; name: string } | null;
  status: AssignmentStatus;
  dueDate: Date | null;
  maxMarks: number | null;
  attachmentUrl: string | null;
} & AssignmentSubmittedCount;

export type AssignmentSubmissionRow = {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: SubmissionStatus;
  note: string | null;
  attachmentUrl: string | null;
  submittedAt: Date | null;
  marksAwarded: number | null;
  feedback: string | null;
  gradedAt: Date | null;
};

export type AssignmentDetailForFaculty = {
  id: string;
  title: string;
  description: string | null;
  subject: SubjectEnum;
  topic: { id: string; name: string } | null;
  batch: { id: string; name: string };
  faculty: { id: string; name: string };
  status: AssignmentStatus;
  dueDate: Date | null;
  maxMarks: number | null;
  attachmentUrl: string | null;
  submissions: AssignmentSubmissionRow[]; // includes PENDING rows for missing submissions
};

export async function createAssignment(
  facultyId: string,
  data: CreateAssignmentInput
) {
  return prisma.assignment.create({
    data: {
      title: data.title,
      description: data.description ?? undefined,
      subject: data.subject,
      topicId: data.topicId ?? undefined,
      batchId: data.batchId,
      facultyId,
      // `status` uses the Prisma default (DRAFT)
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      maxMarks: data.maxMarks ?? undefined,
      attachmentUrl: data.attachmentUrl ?? undefined,
    },
    include: {
      batch: true,
      topic: true,
      faculty: { include: { user: true } },
    },
  });
}

export async function findByFaculty(facultyId: string): Promise<AssignmentListItem[]> {
  const assignments = await prisma.assignment.findMany({
    where: { facultyId },
    include: {
      batch: { select: { id: true, name: true } },
      topic: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const batchIds = Array.from(new Set(assignments.map((a) => a.batchId)));
  const batchStudentCounts = await prisma.batch.findMany({
    where: { id: { in: batchIds } },
    select: {
      id: true,
      _count: { select: { students: true } },
    },
  });

  const totalStudentsByBatchId = new Map(
    batchStudentCounts.map((b) => [b.id, b._count.students])
  );

  const submissionCounts = await prisma.assignmentSubmission.groupBy({
    by: ["assignmentId"],
    _count: { _all: true },
  });

  const submittedCountByAssignmentId = new Map(
    submissionCounts.map((s) => [s.assignmentId, s._count._all])
  );

  return assignments.map((a) => ({
    id: a.id,
    title: a.title,
    subject: a.subject,
    topic: a.topic ? { id: a.topic.id, name: a.topic.name } : null,
    batch: { id: a.batch.id, name: a.batch.name },
    faculty: a.faculty
      ? { id: a.faculty.id, name: a.faculty.user.name }
      : null,
    status: a.status,
    dueDate: a.dueDate,
    maxMarks: a.maxMarks ?? null,
    attachmentUrl: a.attachmentUrl ?? null,
    submittedCount: submittedCountByAssignmentId.get(a.id) ?? 0,
    totalStudents: totalStudentsByBatchId.get(a.batchId) ?? 0,
  }));
}

export async function findByIdForFacultyOrThrow(
  id: string
): Promise<AssignmentDetailForFaculty> {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      batch: { select: { id: true, name: true } },
      topic: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { id: true, name: true } } } },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              rollNo: true,
              user: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!assignment) throw new NotFoundError("Assignment not found");

  // Build PENDING rows for students who haven't submitted.
  const students = await prisma.student.findMany({
    where: { batchId: assignment.batchId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { rollNo: "asc" },
  });

  const submissionByStudentId = new Map(
    assignment.submissions.map((s) => [s.studentId, s])
  );

  const submissions: AssignmentSubmissionRow[] = students.map((st) => {
    const existing = submissionByStudentId.get(st.id);
    if (!existing) {
      return {
        studentId: st.id,
        studentName: st.user.name,
        rollNo: st.rollNo,
        status: "PENDING",
        note: null,
        attachmentUrl: null,
        submittedAt: null,
        marksAwarded: null,
        feedback: null,
        gradedAt: null,
      };
    }

    return {
      studentId: existing.studentId,
      studentName: existing.student.user.name,
      rollNo: existing.student.rollNo,
      status: existing.status,
      note: existing.note,
      attachmentUrl: existing.attachmentUrl,
      submittedAt: existing.submittedAt,
      marksAwarded: existing.marksAwarded,
      feedback: existing.feedback,
      gradedAt: existing.gradedAt,
    };
  });

  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description ?? null,
    subject: assignment.subject,
    topic: assignment.topic ? { id: assignment.topic.id, name: assignment.topic.name } : null,
    batch: { id: assignment.batch.id, name: assignment.batch.name },
    faculty: { id: assignment.faculty.id, name: assignment.faculty.user.name },
    status: assignment.status,
    dueDate: assignment.dueDate,
    maxMarks: assignment.maxMarks ?? null,
    attachmentUrl: assignment.attachmentUrl ?? null,
    submissions,
  };
}

export async function updateAssignment(
  id: string,
  data: UpdateAssignmentInput
) {
  return prisma.assignment.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined
        ? { description: data.description ?? undefined }
        : {}),
      ...(data.subject !== undefined ? { subject: data.subject } : {}),
      ...(data.topicId !== undefined ? { topicId: data.topicId ?? undefined } : {}),
      ...(data.batchId !== undefined ? { batchId: data.batchId } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: data.dueDate ? new Date(data.dueDate) : undefined }
        : {}),
      ...(data.maxMarks !== undefined ? { maxMarks: data.maxMarks ?? undefined } : {}),
      ...(data.attachmentUrl !== undefined
        ? { attachmentUrl: data.attachmentUrl ?? undefined }
        : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
}

export async function deleteAssignment(id: string): Promise<void> {
  // Submissions must be removed before deleting assignment (FK restrict).
  await prisma.assignmentSubmission.deleteMany({ where: { assignmentId: id } });
  await prisma.assignment.delete({ where: { id } });
}

export async function upsertSubmission(params: {
  assignmentId: string;
  studentId: string;
  data: SubmitAssignmentInput;
  isLate: boolean;
}) {
  const { assignmentId, studentId, data, isLate } = params;
  const status: SubmissionStatus = isLate ? "LATE" : "SUBMITTED";
  return prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    update: {
      note: data.note ?? undefined,
      attachmentUrl: data.attachmentUrl ?? undefined,
      status,
      submittedAt: new Date(),
      gradedAt: undefined,
      feedback: undefined,
      marksAwarded: undefined,
    },
    create: {
      assignmentId,
      studentId,
      note: data.note ?? undefined,
      attachmentUrl: data.attachmentUrl ?? undefined,
      status,
      submittedAt: new Date(),
    },
  });
}

export async function gradeSubmission(params: {
  assignmentId: string;
  studentId: string;
  data: GradeSubmissionInput;
}) {
  const { assignmentId, studentId, data } = params;
  return prisma.assignmentSubmission.update({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    data: {
      marksAwarded: data.marksAwarded,
      feedback: data.feedback ?? undefined,
      status: "GRADED",
      gradedAt: new Date(),
    },
  });
}

export async function findSubmissionForStudent(
  assignmentId: string,
  studentId: string
) {
  return prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    select: {
      id: true,
      status: true,
      note: true,
      attachmentUrl: true,
      submittedAt: true,
      marksAwarded: true,
      feedback: true,
      gradedAt: true,
    },
  });
}

export type StudentAssignmentListItem = {
  id: string;
  title: string;
  description: string | null;
  subject: SubjectEnum;
  topic: { id: string; name: string } | null;
  batch: { id: string; name: string };
  facultyName: string;
  dueDate: Date | null;
  maxMarks: number | null;
  attachmentUrl: string | null;
  assignmentStatus: AssignmentStatus;
  submission: {
    status: SubmissionStatus;
    note: string | null;
    attachmentUrl: string | null;
    submittedAt: Date | null;
    marksAwarded: number | null;
    feedback: string | null;
    gradedAt: Date | null;
  } | null;
};

export async function findAssignmentsForStudent(params: {
  studentId: string;
  batchId: string;
}): Promise<StudentAssignmentListItem[]> {
  const assignments = await prisma.assignment.findMany({
    where: { batchId: params.batchId, status: "PUBLISHED" },
    include: {
      batch: { select: { id: true, name: true } },
      topic: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { name: true } } } },
      submissions: {
        where: { studentId: params.studentId },
        select: {
          status: true,
          note: true,
          attachmentUrl: true,
          submittedAt: true,
          marksAwarded: true,
          feedback: true,
          gradedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments.map((a) => {
    const sub = a.submissions[0] ?? null;
    return {
      id: a.id,
      title: a.title,
      description: a.description ?? null,
      subject: a.subject,
      topic: a.topic ? { id: a.topic.id, name: a.topic.name } : null,
      batch: { id: a.batch.id, name: a.batch.name },
      facultyName: a.faculty.user.name,
      dueDate: a.dueDate,
      maxMarks: a.maxMarks ?? null,
      attachmentUrl: a.attachmentUrl ?? null,
      assignmentStatus: a.status,
      submission: sub
        ? {
            status: sub.status,
            note: sub.note,
            attachmentUrl: sub.attachmentUrl,
            submittedAt: sub.submittedAt,
            marksAwarded: sub.marksAwarded,
            feedback: sub.feedback,
            gradedAt: sub.gradedAt,
          }
        : null,
    };
  });
}

export async function getAssignmentOwnerInfo(id: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    select: { facultyId: true, status: true },
  });
  if (!assignment) throw new NotFoundError("Assignment not found");
  return assignment;
}

export async function getAssignmentMetaByIdOrThrow(
  id: string
): Promise<{
  status: AssignmentStatus;
  dueDate: Date | null;
  maxMarks: number | null;
  batchId: string;
}> {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    select: { status: true, dueDate: true, maxMarks: true, batchId: true },
  });
  if (!assignment) throw new NotFoundError("Assignment not found");
  return assignment;
}

