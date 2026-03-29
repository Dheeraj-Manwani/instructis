import prisma from "@/lib/prisma";
import type { ClassStatus, SubjectEnum } from "@prisma/client";

type WeekRange = {
  weekStart: Date;
  weekEnd: Date;
};

export async function findFacultyIdAndBatchIdsByUserId(userId: string) {
  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    select: {
      id: true,
      batches: {
        select: {
          batchId: true,
          batch: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!faculty) return null;

  return {
    id: faculty.id,
    batches: faculty.batches.map((item) => item.batch),
    batchIds: new Set(faculty.batches.map((item) => item.batchId)),
  };
}

export async function listFacultyClasses(params: {
  facultyId: string;
  week: WeekRange;
  batchId?: string;
  subject?: SubjectEnum;
}) {
  const rows = await prisma.classSession.findMany({
    where: {
      facultyId: params.facultyId,
      date: {
        gte: params.week.weekStart,
        lte: params.week.weekEnd,
      },
      ...(params.batchId ? { batchId: params.batchId } : {}),
      ...(params.subject ? { subject: params.subject } : {}),
    },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
        },
      },
      faculty: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    groupId: row.groupId,
    batchId: row.batchId,
    batchName: row.batch.name,
    facultyId: row.facultyId,
    facultyName: row.faculty.user.name,
    subject: row.subject,
    title: row.title,
    topic: row.topic,
    description: row.description,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    meetLink: row.meetLink,
    status: row.status,
    cancelNote: row.cancelNote,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function listUpcomingClassesForFaculty(facultyId: string, limit: number) {
  const now = new Date();
  const rows = await prisma.classSession.findMany({
    where: {
      facultyId,
      endTime: { gte: now },
      status: { not: "CANCELLED" },
    },
    include: {
      batch: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { name: true } } } },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    groupId: row.groupId,
    batchId: row.batchId,
    batchName: row.batch.name,
    facultyId: row.facultyId,
    facultyName: row.faculty.user.name,
    subject: row.subject,
    title: row.title,
    topic: row.topic,
    description: row.description,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    meetLink: row.meetLink,
    status: row.status,
    cancelNote: row.cancelNote,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function findOverlappingClassForBatch(params: {
  batchId: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  excludeClassId?: string;
}) {
  const dayStart = new Date(params.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return prisma.classSession.findFirst({
    where: {
      batchId: params.batchId,
      date: {
        gte: dayStart,
        lt: dayEnd,
      },
      startTime: { lt: params.endTime },
      endTime: { gt: params.startTime },
      status: { not: "CANCELLED" },
      ...(params.excludeClassId ? { id: { not: params.excludeClassId } } : {}),
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
    },
  });
}

export async function createClassSession(data: {
  batchId: string;
  facultyId: string;
  subject: SubjectEnum;
  title: string;
  topic?: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  meetLink?: string;
  notes?: string;
  groupId?: string;
}) {
  return prisma.classSession.create({
    data: {
      batchId: data.batchId,
      facultyId: data.facultyId,
      subject: data.subject,
      title: data.title,
      topic: data.topic,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      meetLink: data.meetLink,
      notes: data.notes,
      groupId: data.groupId,
      status: "SCHEDULED",
    },
    include: {
      batch: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { name: true } } } },
    },
  });
}

export async function createClassSessionsBulk(
  sessions: Array<{
    batchId: string;
    facultyId: string;
    subject: SubjectEnum;
    title: string;
    topic?: string;
    description?: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    meetLink?: string;
    notes?: string;
    groupId: string;
  }>
) {
  if (!sessions.length) return { count: 0 };
  return prisma.classSession.createMany({
    data: sessions.map((session) => ({
      ...session,
      status: "SCHEDULED" as const,
    })),
  });
}

export async function findClassById(classId: string) {
  return prisma.classSession.findUnique({
    where: { id: classId },
    include: {
      batch: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

export async function updateClassSession(
  classId: string,
  data: Partial<{
    batchId: string;
    subject: SubjectEnum;
    title: string;
    topic: string | null;
    description: string | null;
    date: Date;
    startTime: Date;
    endTime: Date;
    meetLink: string | null;
    notes: string | null;
    status: ClassStatus;
    cancelNote: string | null;
  }>
) {
  return prisma.classSession.update({
    where: { id: classId },
    data,
    include: {
      batch: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

export async function deleteClassSession(classId: string) {
  await prisma.attendance.deleteMany({
    where: { classSessionId: classId },
  });
  await prisma.classSession.delete({ where: { id: classId } });
}

export async function listFutureGroupedSessions(params: {
  groupId: string;
  facultyId: string;
  fromDate: Date;
  now: Date;
}) {
  return prisma.classSession.findMany({
    where: {
      groupId: params.groupId,
      facultyId: params.facultyId,
      date: { gte: params.fromDate },
      endTime: { gte: params.now },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function countFutureGroupedDeletableSessions(params: {
  groupId: string;
  facultyId: string;
  fromDate: Date;
  now: Date;
}) {
  return prisma.classSession.count({
    where: {
      groupId: params.groupId,
      facultyId: params.facultyId,
      date: { gte: params.fromDate },
      startTime: { gt: params.now },
      status: "SCHEDULED",
    },
  });
}

export async function deleteFutureGroupedSessions(params: {
  groupId: string;
  facultyId: string;
  fromDate: Date;
  now: Date;
}) {
  const rows = await prisma.classSession.findMany({
    where: {
      groupId: params.groupId,
      facultyId: params.facultyId,
      date: { gte: params.fromDate },
      startTime: { gt: params.now },
      status: "SCHEDULED",
    },
    select: { id: true },
  });

  if (!rows.length) return { count: 0 };

  const ids = rows.map((row) => row.id);

  await prisma.$transaction([
    prisma.attendance.deleteMany({
      where: { classSessionId: { in: ids } },
    }),
    prisma.classSession.deleteMany({
      where: { id: { in: ids } },
    }),
  ]);

  return { count: ids.length };
}

export async function findStudentByUserId(userId: string) {
  return prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      batchId: true,
    },
  });
}

export async function listStudentClasses(params: {
  batchId: string;
  tab: "upcoming" | "today" | "past";
}) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const where =
    params.tab === "upcoming"
      ? {
          batchId: params.batchId,
          date: { gte: todayStart },
        }
      : params.tab === "today"
        ? {
            batchId: params.batchId,
            date: { gte: todayStart, lt: tomorrowStart },
          }
        : {
            batchId: params.batchId,
            OR: [
              { date: { lt: todayStart } },
              { status: { in: ["COMPLETED", "CANCELLED"] as ClassStatus[] } },
            ],
          };

  const rows = await prisma.classSession.findMany({
    where,
    include: {
      batch: { select: { id: true, name: true } },
      faculty: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy:
      params.tab === "past"
        ? [{ date: "desc" as const }, { startTime: "desc" as const }]
        : [{ date: "asc" as const }, { startTime: "asc" as const }],
  });

  return rows.map((row) => ({
    id: row.id,
    groupId: row.groupId,
    batchId: row.batchId,
    batchName: row.batch.name,
    facultyId: row.facultyId,
    facultyName: row.faculty.user.name,
    subject: row.subject,
    title: row.title,
    topic: row.topic,
    description: row.description,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    meetLink: row.meetLink,
    status: row.status,
    cancelNote: row.cancelNote,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}
