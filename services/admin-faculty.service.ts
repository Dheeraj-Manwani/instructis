import { ValidationError } from "@/lib/utils/errors";
import type { PaginationMeta } from "@/types";
import { hash } from "bcryptjs";
import * as facultyRepository from "@/repositories/admin-faculty.repository";

export type ListFacultiesResult = {
  data: facultyRepository.FacultyListItem[];
  departments: string[];
  meta: PaginationMeta;
};

function randomUpperChar() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function buildFacultyCodeCandidate() {
  const letters = `${randomUpperChar()}${randomUpperChar()}`;
  const numbers = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${letters}${numbers}`;
}

async function generateUniqueFacultyCode() {
  for (let i = 0; i < 100; i += 1) {
    const candidate = buildFacultyCodeCandidate();
    const existing = await facultyRepository.findFacultyByCode(candidate);
    if (!existing) return candidate;
  }
  throw new ValidationError("Unable to generate unique faculty ID. Please try again.");
}

function normalizeFacultyCode(input: string) {
  return input.trim().toUpperCase();
}

export async function listFaculties(params: {
  page: number;
  limit: number;
  search?: string;
  department?: string;
}): Promise<ListFacultiesResult> {
  const [facultyResult, departments] = await Promise.all([
    facultyRepository.findManyFaculties({
      page: params.page,
      limit: params.limit,
      search: params.search,
      department: params.department,
    }),
    facultyRepository.findDistinctFacultyDepartments(),
  ]);

  return {
    data: facultyResult.faculties,
    departments,
    meta: {
      total: facultyResult.total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(facultyResult.total / params.limit),
    },
  };
}

export async function createFaculty(input: {
  name: string;
  email: string;
  password: string;
  title?: string | null;
  department?: string | null;
}) {
  const existing = await facultyRepository.findUserByEmail(input.email);
  if (existing) {
    throw new ValidationError("Email is already in use");
  }

  const passwordHash = await hash(input.password, 10);
  const userId = crypto.randomUUID();
  const facultyCode = await generateUniqueFacultyCode();

  const created = await facultyRepository.createFacultyWithCredentialAccount({
    userId,
    facultyCode,
    name: input.name,
    email: input.email,
    passwordHash,
    title: input.title,
    department: input.department,
  });

  return facultyRepository.updateFacultyAndUser({
    facultyId: created.faculty.id,
    userId: created.user.id,
  });
}

export async function updateFaculty(
  facultyId: string,
  input: {
    name?: string;
    email?: string;
    facultyCode?: string;
    title?: string | null;
    department?: string | null;
    newPassword?: string;
    confirmPassword?: string;
  }
) {
  const faculty = await facultyRepository.findFacultyWithUserOrThrow(facultyId);

  if (input.email && input.email !== faculty.user.email) {
    const existing = await facultyRepository.findUserByEmail(input.email);
    if (existing && existing.id !== faculty.userId) {
      throw new ValidationError("Email is already in use");
    }
  }

  if (input.facultyCode) {
    const normalizedCode = normalizeFacultyCode(input.facultyCode);
    const existingByCode = await facultyRepository.findFacultyByCode(normalizedCode);
    if (existingByCode && existingByCode.id !== facultyId) {
      throw new ValidationError("Faculty ID is already in use");
    }
    input.facultyCode = normalizedCode;
  }

  if (input.newPassword) {
    if (!input.confirmPassword || input.newPassword !== input.confirmPassword) {
      throw new ValidationError("Password confirmation does not match");
    }
    const passwordHash = await hash(input.newPassword, 10);
    await facultyRepository.upsertCredentialPassword(faculty.userId, passwordHash);
  }

  return facultyRepository.updateFacultyAndUser({
    facultyId,
    userId: faculty.userId,
    facultyCode: input.facultyCode,
    name: input.name,
    email: input.email,
    title: input.title,
    department: input.department,
  });
}

export async function removeFacultyRole(facultyId: string) {
  const faculty = await facultyRepository.findFacultyWithUserOrThrow(facultyId);
  await facultyRepository.setUserRoleToUser(faculty.userId);
  return { facultyId, userId: faculty.userId };
}
