import prisma from "@/lib/prisma";
import type { SubjectEnum } from "@prisma/client";
import { NotFoundError } from "@/lib/utils/errors";
import type { CreateClassSessionInput } from "@/lib/schemas/attendance.schema";

export type AttendanceStudent = {
  id: string;
  rollNo: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

export type AttendanceRow = {
  studentId: string;
  isPresent: boolean;
  note: string | null;
  createdAt: Date;
  student: AttendanceStudent;
};

export type ClassSessionHistoryItem = {
  id: string;
  batchId: string;
  subject: SubjectEnum;
  topic: string | null;
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  notes: string | null;
  presentCount: number;
  totalCount: number;
};

export type ClassSessionDetailForFaculty = {
  id: string;
  batchId: string;
  facultyId: string;
  subject: SubjectEnum;
  topic: string | null;
  date: Date;
  startTime: Date | null;
  endTime: Date | null;
  notes: string | null;
  createdAt: Date;
  batchStudents: AttendanceStudent[];
  attendances: AttendanceRow[];
};

export async function createSessionWithAttendance(
  facultyId: string,
  data: CreateClassSessionInput
) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.classSession.create({
      data: {
        batchId: data.batchId,
        facultyId,
        subject: data.subject,
        topic: data.topic,
        date: new Date(data.date),
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        notes: data.notes,
      },
      select: {
        id: true,
        batchId: true,
        facultyId: true,
        subject: true,
        topic: true,
        date: true,
        startTime: true,
        endTime: true,
        notes: true,
        createdAt: true,
      },
    });

    await tx.attendance.createMany({
      data: data.attendances.map((a) => ({
        classSessionId: session.id,
        studentId: a.studentId,
        isPresent: a.isPresent,
        note: a.note,
      })),
    });

    return session;
  });
}

export async function findSessionsByBatchForFaculty(params: {
  facultyId: string;
  batchId: string;
}): Promise<ClassSessionHistoryItem[]> {
  const sessions = await prisma.classSession.findMany({
    where: {
      batchId: params.batchId,
      facultyId: params.facultyId,
    },
    include: {
      attendances: {
        select: {
          isPresent: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return sessions.map((s) => {
    const totalCount = s.attendances.length;
    const presentCount = s.attendances.filter((a) => a.isPresent).length;
    return {
      id: s.id,
      batchId: s.batchId,
      subject: s.subject,
      topic: s.topic,
      date: s.date,
      startTime: s.startTime ?? null,
      endTime: s.endTime ?? null,
      notes: s.notes ?? null,
      presentCount,
      totalCount,
    };
  });
}

export async function findSessionDetailForFaculty(
  sessionId: string
): Promise<ClassSessionDetailForFaculty> {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: {
      batch: {
        include: {
          students: {
            include: {
              user: true,
            },
            orderBy: { rollNo: "asc" },
          },
        },
      },
      attendances: {
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { student: { rollNo: "asc" } },
      },
    },
  });

  if (!session) throw new NotFoundError("Session not found");

  return {
    id: session.id,
    batchId: session.batchId,
    facultyId: session.facultyId,
    subject: session.subject,
    topic: session.topic,
    date: session.date,
    startTime: session.startTime ?? null,
    endTime: session.endTime ?? null,
    notes: session.notes ?? null,
    createdAt: session.createdAt,
    batchStudents: session.batch.students.map((st) => ({
      id: st.id,
      rollNo: st.rollNo,
      user: {
        id: st.user.id,
        name: st.user.name,
        image: st.user.image,
      },
    })),
    attendances: session.attendances.map((att) => ({
      studentId: att.studentId,
      isPresent: att.isPresent,
      note: att.note ?? null,
      createdAt: att.createdAt,
      student: {
        id: att.student.id,
        rollNo: att.student.rollNo,
        user: {
          id: att.student.user.id,
          name: att.student.user.name,
          image: att.student.user.image,
        },
      },
    })),
  };
}

export async function getSessionOrThrow(sessionId: string) {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { id: true, facultyId: true },
  });
  if (!session) throw new NotFoundError("Session not found");
  return session;
}

export async function updateAttendanceForSession(
  sessionId: string,
  attendances: Array<{
    studentId: string;
    isPresent: boolean;
    note?: string;
  }>
) {
  if (attendances.length === 0) return [];

  return prisma.$transaction(
    attendances.map((a) =>
      prisma.attendance.upsert({
        where: {
          studentId_classSessionId: {
            studentId: a.studentId,
            classSessionId: sessionId,
          },
        },
        update: {
          isPresent: a.isPresent,
          ...(a.note !== undefined ? { note: a.note } : {}),
        },
        create: {
          classSessionId: sessionId,
          studentId: a.studentId,
          isPresent: a.isPresent,
          ...(a.note !== undefined ? { note: a.note } : {}),
        },
      })
    )
  );
}

export async function findSessionsForStudent(params: {
  studentId: string;
  batchId: string;
}): Promise<
  Array<{
    id: string;
    subject: SubjectEnum;
    topic: string | null;
    date: Date;
    attendances: Array<{
      isPresent: boolean;
      note: string | null;
    }>;
  }>
> {
  const sessions = await prisma.classSession.findMany({
    where: { batchId: params.batchId },
    include: {
      attendances: {
        where: { studentId: params.studentId },
        select: { isPresent: true, note: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return sessions.map((s) => ({
    id: s.id,
    subject: s.subject,
    topic: s.topic,
    date: s.date,
    attendances: s.attendances.map((a) => ({
      isPresent: a.isPresent,
      note: a.note ?? null,
    })),
  }));
}

