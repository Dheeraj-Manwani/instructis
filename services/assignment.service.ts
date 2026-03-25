import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/utils/errors";
import * as facultyRepository from "@/repositories/faculty.repository";
import * as studentRepository from "@/repositories/student.repository";
import * as assignmentRepository from "@/repositories/assignment.repository";
import type {
  CreateAssignmentInput,
  GradeSubmissionInput,
  SubmitAssignmentInput,
  UpdateAssignmentInput,
} from "@/lib/schemas/assignment.schema";

export async function createAssignment(
  facultyUserId: string,
  data: CreateAssignmentInput
) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");
  return assignmentRepository.createAssignment(facultyId, data);
}

export async function listForFaculty(facultyUserId: string) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");
  return assignmentRepository.findByFaculty(facultyId);
}

export async function getDetailForFaculty(facultyUserId: string, assignmentId: string) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");

  const assignment = await assignmentRepository.findByIdForFacultyOrThrow(assignmentId);
  if (assignment.faculty.id !== facultyId) {
    throw new ForbiddenError("You do not own this assignment");
  }
  return assignment;
}

export async function updateForFaculty(
  facultyUserId: string,
  assignmentId: string,
  data: UpdateAssignmentInput
) {
  await getDetailForFaculty(facultyUserId, assignmentId);
  return assignmentRepository.updateAssignment(assignmentId, data);
}

export async function publishForFaculty(facultyUserId: string, assignmentId: string) {
  return updateForFaculty(facultyUserId, assignmentId, { status: "PUBLISHED" });
}

export async function closeForFaculty(facultyUserId: string, assignmentId: string) {
  return updateForFaculty(facultyUserId, assignmentId, { status: "CLOSED" });
}

export async function deleteForFaculty(facultyUserId: string, assignmentId: string) {
  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");

  const assignment = await assignmentRepository.findByIdForFacultyOrThrow(assignmentId);
  if (assignment.faculty.id !== facultyId) {
    throw new ForbiddenError("You do not own this assignment");
  }
  if (assignment.status === "PUBLISHED") {
    throw new ForbiddenError("Cannot delete a published assignment. Close it first.");
  }
  if (assignment.status === "CLOSED") {
    throw new ForbiddenError("Cannot delete a closed assignment. Delete draft only.");
  }

  await assignmentRepository.deleteAssignment(assignmentId);
}

export async function gradeSubmissionForFaculty(params: {
  facultyUserId: string;
  assignmentId: string;
  studentUserId: string;
  data: GradeSubmissionInput;
}) {
  const { facultyUserId, assignmentId, studentUserId, data } = params;

  const facultyId = await facultyRepository.findFacultyIdByUserId(facultyUserId);
  if (!facultyId) throw new NotFoundError("Faculty profile not found");
  const studentId = await studentRepository.getStudentByUserIdOrThrow(studentUserId).then(
    (s) => s.id
  );

  const assignment = await assignmentRepository.findByIdForFacultyOrThrow(assignmentId);
  if (assignment.faculty.id !== facultyId) {
    throw new ForbiddenError("You do not own this assignment");
  }

  const submission = await assignmentRepository.findSubmissionForStudent(
    assignmentId,
    studentId
  );
  if (!submission) {
    throw new ValidationError("Student has not submitted yet");
  }
  if (submission.status === "PENDING") {
    throw new ValidationError("Student has not submitted yet");
  }
  if (assignment.maxMarks != null && data.marksAwarded > assignment.maxMarks) {
    throw new ValidationError("Marks awarded exceed maximum marks");
  }

  return assignmentRepository.gradeSubmission({
    assignmentId,
    studentId,
    data,
  });
}

export async function listForStudent(studentUserId: string, batchId: string) {
  const student = await studentRepository.getStudentByUserIdOrThrow(studentUserId);
  if (!student.batchId) {
    throw new ValidationError("Student is not assigned to a batch");
  }
  if (student.batchId !== batchId) {
    throw new ForbiddenError("You do not have permission for this batch");
  }
  return assignmentRepository.findAssignmentsForStudent({
    studentId: student.id,
    batchId,
  });
}

export async function submitForStudent(
  studentUserId: string,
  assignmentId: string,
  data: SubmitAssignmentInput
) {
  const student = await studentRepository.getStudentByUserIdOrThrow(studentUserId);
  if (!student.batchId) {
    throw new ValidationError("Student is not assigned to a batch");
  }

  const assignment = await assignmentRepository.getAssignmentMetaByIdOrThrow(assignmentId);
  if (assignment.batchId !== student.batchId) {
    throw new ForbiddenError("You do not have permission for this assignment");
  }
  if (assignment.status !== "PUBLISHED") {
    throw new ForbiddenError("This assignment is not open for submission");
  }

  const isLate = assignment.dueDate ? new Date() > assignment.dueDate : false;

  return assignmentRepository.upsertSubmission({
    assignmentId,
    studentId: student.id,
    data,
    isLate,
  });
}

