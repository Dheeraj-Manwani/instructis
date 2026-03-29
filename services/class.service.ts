import { addDays, endOfWeek, isSameDay, startOfDay, startOfWeek } from "date-fns";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import * as classRepository from "@/repositories/class.repository";
import type {
  CreateClassBody,
  FacultyClassListQuery,
  StudentClassListQuery,
  UpdateClassBody,
} from "@/lib/schemas/class.schema";
import type { ClassStatus } from "@prisma/client";

function startAndEndOfSelectedWeek(weekStart?: string) {
  const base = weekStart ? new Date(weekStart) : new Date();
  const normalizedStart = startOfWeek(base, { weekStartsOn: 1 });
  const normalizedEnd = endOfWeek(base, { weekStartsOn: 1 });
  return {
    weekStart: normalizedStart,
    weekEnd: normalizedEnd,
  };
}

function combineDateAndTime(dateIso: string, timeIso: string) {
  const date = new Date(dateIso);
  const time = new Date(timeIso);

  const combined = new Date(date);
  combined.setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  );
  return combined;
}

function assertEndAfterStart(startTime: Date, endTime: Date) {
  if (endTime <= startTime) {
    throw new ValidationError("End time must be after start time");
  }
}

function assertStatusChangeAllowed(nextStatus: ClassStatus, now: Date, classDate: Date, endTime: Date) {
  if (nextStatus === "LIVE" && !isSameDay(classDate, now)) {
    throw new ValidationError("Class can be marked LIVE only on the same day");
  }
  if (nextStatus === "COMPLETED" && endTime > now) {
    throw new ValidationError("Class can be marked COMPLETED only after class time has passed");
  }
}

export async function listForFaculty(facultyUserId: string, query: FacultyClassListQuery) {
  const faculty = await classRepository.findFacultyIdAndBatchIdsByUserId(facultyUserId);
  if (!faculty) throw new NotFoundError("Faculty profile not found");

  if (query.batchId && !faculty.batchIds.has(query.batchId)) {
    throw new ForbiddenError("You are not assigned to this batch");
  }

  const week = startAndEndOfSelectedWeek(query.weekStart);

  const classes = await classRepository.listFacultyClasses({
    facultyId: faculty.id,
    week,
    batchId: query.batchId,
    subject: query.subject,
  });

  const upcoming = await classRepository.listUpcomingClassesForFaculty(faculty.id, 5);

  const weekStartDay = startOfDay(week.weekStart).getTime();
  const weekEndDay = addDays(startOfDay(week.weekEnd), 1).getTime();
  const thisWeekClasses = classes.filter((item) => {
    const t = item.date.getTime();
    return t >= weekStartDay && t < weekEndDay;
  });

  const stats = {
    weekTotal: thisWeekClasses.length,
    completed: thisWeekClasses.filter((item) => item.status === "COMPLETED").length,
    cancelled: thisWeekClasses.filter((item) => item.status === "CANCELLED").length,
  };

  return {
    classes,
    upcoming,
    stats,
    week: {
      start: week.weekStart,
      end: week.weekEnd,
    },
    batches: faculty.batches,
  };
}

export async function createForFaculty(facultyUserId: string, payload: CreateClassBody) {
  const faculty = await classRepository.findFacultyIdAndBatchIdsByUserId(facultyUserId);
  if (!faculty) throw new NotFoundError("Faculty profile not found");
  if (!faculty.batchIds.has(payload.batchId)) {
    throw new ForbiddenError("You are not assigned to this batch");
  }

  const classDate = startOfDay(new Date(payload.date));
  const startTime = combineDateAndTime(payload.date, payload.startTime);
  const endTime = combineDateAndTime(payload.date, payload.endTime);
  assertEndAfterStart(startTime, endTime);

  const overlap = await classRepository.findOverlappingClassForBatch({
    batchId: payload.batchId,
    date: classDate,
    startTime,
    endTime,
  });

  const created = await classRepository.createClassSession({
    batchId: payload.batchId,
    facultyId: faculty.id,
    subject: payload.subject,
    title: payload.title,
    topic: payload.topic?.trim() ? payload.topic.trim() : undefined,
    description: payload.description?.trim() ? payload.description.trim() : undefined,
    date: classDate,
    startTime,
    endTime,
    meetLink: payload.meetLink?.trim() ? payload.meetLink.trim() : undefined,
    notes: payload.notes?.trim() ? payload.notes.trim() : undefined,
  });

  const warnings: string[] = [];
  if (startTime < new Date()) {
    warnings.push("This class is scheduled in the past.");
  }
  if (overlap) {
    warnings.push("Another class already exists in this batch for an overlapping time slot.");
  }

  return {
    classSession: {
      ...created,
      facultyName: created.faculty.user.name,
      batchName: created.batch.name,
    },
    warnings,
  };
}

export async function updateForFaculty(
  facultyUserId: string,
  classId: string,
  payload: UpdateClassBody
) {
  const faculty = await classRepository.findFacultyIdAndBatchIdsByUserId(facultyUserId);
  if (!faculty) throw new NotFoundError("Faculty profile not found");

  const existing = await classRepository.findClassById(classId);
  if (!existing) throw new NotFoundError("Class not found");
  if (existing.facultyId !== faculty.id) {
    throw new ForbiddenError("You can only edit your own class");
  }

  const nextBatchId = payload.batchId ?? existing.batchId;
  if (!faculty.batchIds.has(nextBatchId)) {
    throw new ForbiddenError("You are not assigned to this batch");
  }

  const nextDate = payload.date ? startOfDay(new Date(payload.date)) : existing.date;
  const nextStartTime = payload.startTime
    ? combineDateAndTime(nextDate.toISOString(), payload.startTime)
    : existing.startTime;
  const nextEndTime = payload.endTime
    ? combineDateAndTime(nextDate.toISOString(), payload.endTime)
    : existing.endTime;

  assertEndAfterStart(nextStartTime, nextEndTime);

  if (payload.status) {
    assertStatusChangeAllowed(payload.status, new Date(), nextDate, nextEndTime);
  }

  const hasScheduleChanged =
    nextBatchId !== existing.batchId ||
    nextDate.getTime() !== existing.date.getTime() ||
    nextStartTime.getTime() !== existing.startTime.getTime() ||
    nextEndTime.getTime() !== existing.endTime.getTime();

  const warnings: string[] = [];
  if (hasScheduleChanged) {
    const overlap = await classRepository.findOverlappingClassForBatch({
      batchId: nextBatchId,
      date: nextDate,
      startTime: nextStartTime,
      endTime: nextEndTime,
      excludeClassId: classId,
    });
    if (overlap) {
      warnings.push("Another class already exists in this batch for an overlapping time slot.");
    }
  }

  const updated = await classRepository.updateClassSession(classId, {
    ...(payload.batchId !== undefined ? { batchId: nextBatchId } : {}),
    ...(payload.subject !== undefined ? { subject: payload.subject } : {}),
    ...(payload.title !== undefined ? { title: payload.title } : {}),
    ...(payload.topic !== undefined ? { topic: payload.topic } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(payload.date !== undefined ? { date: nextDate } : {}),
    ...(payload.startTime !== undefined ? { startTime: nextStartTime } : {}),
    ...(payload.endTime !== undefined ? { endTime: nextEndTime } : {}),
    ...(payload.meetLink !== undefined ? { meetLink: payload.meetLink } : {}),
    ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.cancelNote !== undefined ? { cancelNote: payload.cancelNote } : {}),
  });

  return {
    classSession: {
      ...updated,
      facultyName: updated.faculty.user.name,
      batchName: updated.batch.name,
    },
    warnings,
  };
}

export async function deleteForFaculty(facultyUserId: string, classId: string) {
  const faculty = await classRepository.findFacultyIdAndBatchIdsByUserId(facultyUserId);
  if (!faculty) throw new NotFoundError("Faculty profile not found");

  const existing = await classRepository.findClassById(classId);
  if (!existing) throw new NotFoundError("Class not found");
  if (existing.facultyId !== faculty.id) {
    throw new ForbiddenError("You can only delete your own class");
  }

  if (!(existing.status === "SCHEDULED" && existing.startTime > new Date())) {
    throw new ForbiddenError("Only future SCHEDULED classes can be deleted");
  }

  await classRepository.deleteClassSession(classId);
}

export async function listForStudent(studentUserId: string, query: StudentClassListQuery) {
  const student = await classRepository.findStudentByUserId(studentUserId);
  if (!student) throw new NotFoundError("Student profile not found");
  if (!student.batchId) throw new ValidationError("Student is not assigned to a batch");

  const classes = await classRepository.listStudentClasses({
    batchId: student.batchId,
    tab: query.tab,
  });

  return {
    classes,
    tab: query.tab,
  };
}
