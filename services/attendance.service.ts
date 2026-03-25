import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import * as attendanceRepository from "@/repositories/attendance.repository";
import * as facultyRepository from "@/repositories/faculty.repository";
import * as studentRepository from "@/repositories/student.repository";
import type { CreateClassSessionInput, UpdateAttendanceInput } from "@/lib/schemas/attendance.schema";

export async function createSession(
  facultyUserId: string,
  data: CreateClassSessionInput
) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");
  return attendanceRepository.createSessionWithAttendance(facultyId, data);
}

export async function getSessionsForBatchForFaculty(
  facultyUserId: string,
  batchId: string
) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");
  return attendanceRepository.findSessionsByBatchForFaculty({
    facultyId,
    batchId,
  });
}

export async function getSessionDetailForFaculty(
  facultyUserId: string,
  sessionId: string
) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");

  const session = await attendanceRepository.findSessionDetailForFaculty(sessionId);
  if (session.facultyId !== facultyId) {
    throw new ForbiddenError("You do not own this session");
  }

  return session;
}

export async function updateAttendanceForSession(
  facultyUserId: string,
  sessionId: string,
  data: UpdateAttendanceInput
) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");

  const session = await attendanceRepository.getSessionOrThrow(sessionId);
  if (session.facultyId !== facultyId) {
    throw new ForbiddenError("You do not own this session");
  }

  if (!data.attendances || data.attendances.length === 0) {
    throw new ValidationError("At least one attendance record is required");
  }

  return attendanceRepository.updateAttendanceForSession(sessionId, data.attendances);
}

export type StudentAttendanceSummary = {
  subject: string;
  present: number;
  total: number;
  percentage: number;
};

export type StudentAttendanceSession = {
  id: string;
  date: Date;
  subject: string;
  topic: string | null;
  status: "PRESENT" | "ABSENT";
  note: string | null;
};

export async function getStudentAttendance(
  studentUserId: string,
  batchId: string
) {
  const student = await studentRepository.getStudentByUserIdOrThrow(studentUserId);
  if (!student.batchId) {
    throw new ValidationError("Student is not assigned to a batch");
  }
  if (student.batchId !== batchId) {
    throw new ForbiddenError("You do not have permission for this batch");
  }
  const sessions = await attendanceRepository.findSessionsForStudent({
    studentId: student.id,
    batchId,
  });

  const subjectMap: Record<
    string,
    { present: number; total: number }
  > = {};

  const studentSessions: StudentAttendanceSession[] = sessions.map((s) => {
    const att = s.attendances[0];
    const isPresent = !!att?.isPresent;
    const subject = s.subject;
    if (!subjectMap[subject]) subjectMap[subject] = { present: 0, total: 0 };
    subjectMap[subject].total += 1;
    if (isPresent) subjectMap[subject].present += 1;

    return {
      id: s.id,
      date: s.date,
      subject,
      topic: s.topic,
      status: isPresent ? "PRESENT" : "ABSENT",
      note: att?.note ?? null,
    };
  });

  const subjectSummary: StudentAttendanceSummary[] = Object.entries(subjectMap).map(
    ([subject, { present, total }]) => ({
      subject,
      present,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    })
  );

  return { sessions: studentSessions, subjectSummary };
}

