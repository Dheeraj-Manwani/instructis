import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { z } from "zod";
import { ExamType, RoleEnum } from "@prisma/client";

import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import prisma from "@/lib/prisma";
import { batchIdParamSchema } from "@/lib/schemas/batch.schema";

const emailSchema = z.string().email();

type RowError = {
  row: number;
  field: string;
  reason: string;
};

function normalizeHeader(val: ExcelJS.CellValue | undefined): string {
  if (typeof val === "string") return val.trim().replace(/\n/g, " ");
  if (val == null) return "";
  if (typeof val === "number") return String(val);
  if (typeof val === "object" && "text" in (val as any)) {
    return String((val as any).text).trim().replace(/\n/g, " ");
  }
  return "";
}

function getWorksheetByName(workbook: ExcelJS.Workbook, name: string): ExcelJS.Worksheet {
  const sheet =
    workbook.worksheets.find((ws) => ws.name.toLowerCase() === name.toLowerCase()) ??
    workbook.getWorksheet(name);
  if (!sheet) {
    throw new ValidationError(`Worksheet "${name}" not found in uploaded file`);
  }
  return sheet;
}

function parseDob(value: ExcelJS.CellValue | undefined, rowIndex: number, errors: RowError[]): Date | null {
  if (value == null || value === "") return null;

  // Excel date serial
  if (typeof value === "number") {
    const date = ExcelJS.DateUtils.excelToJsDate
      ? (ExcelJS.DateUtils as any).excelToJsDate(value)
      : new Date(Math.round((value - 25569) * 86400 * 1000)); // fallback
    if (Number.isNaN(date.getTime())) {
      errors.push({ row: rowIndex, field: "dob", reason: "Invalid date format" });
      return null;
    }
    return date;
  }

  const text =
    typeof value === "string"
      ? value.trim()
      : typeof value === "object" && "text" in (value as any)
      ? String((value as any).text).trim()
      : "";

  if (!text) return null;

  const parts = text.split(/[\/\-]/);
  if (parts.length !== 3) {
    errors.push({ row: rowIndex, field: "dob", reason: "Date must be in DD/MM/YYYY format" });
    return null;
  }

  const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (!dd || !mm || !yyyy) {
    errors.push({ row: rowIndex, field: "dob", reason: "Date must be in DD/MM/YYYY format" });
    return null;
  }

  const date = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
    errors.push({ row: rowIndex, field: "dob", reason: "Invalid date value" });
    return null;
  }

  return date;
}

async function parseStudentsSheet(
  worksheet: ExcelJS.Worksheet,
  defaultBatchId: string
): Promise<{
  rows: {
    name: string;
    email: string;
    rollNo: string;
    targetExam: ExamType;
    batchName?: string;
    parentName?: string | null;
    parentPhone?: string | null;
    parentEmail?: string | null;
    address?: string | null;
    dob?: Date | null;
  }[];
  errors: RowError[];
}> {
  const errors: RowError[] = [];

  // Headers in row 4
  const headerRow = worksheet.getRow(4);
  const headers: string[] = [];
  for (let col = 1; col <= headerRow.cellCount; col++) {
    headers.push(normalizeHeader(headerRow.getCell(col).value));
  }

  const expectedHeaders = [
    "#",
    "Full Name",
    "Email",
    "Roll No",
    "Target Exam",
    "Batch Name",
    "Parent Name",
    "Parent Phone",
    "Parent Email",
    "Address",
    "Date of Birth",
  ];

  const trimmedHeaders = headers.slice(0, expectedHeaders.length);
  const headersMatch =
    trimmedHeaders.length === expectedHeaders.length &&
    trimmedHeaders.every((h, idx) => h === expectedHeaders[idx]);

  if (!headersMatch) {
    throw new ValidationError('Students sheet headers do not match the expected format');
  }

  const rows: {
    name: string;
    email: string;
    rollNo: string;
    targetExam: ExamType;
    batchName?: string;
    parentName?: string | null;
    parentPhone?: string | null;
    parentEmail?: string | null;
    address?: string | null;
    dob?: Date | null;
  }[] = [];

  const seenRollNos = new Set<string>();

  // Data rows 6 to 105
  for (let rowIndex = 6; rowIndex <= 105; rowIndex++) {
    const row = worksheet.getRow(rowIndex);

    const name = String(row.getCell(2).value ?? "").toString().trim();
    const email = String(row.getCell(3).value ?? "").toString().trim();
    const rollNo = String(row.getCell(4).value ?? "").toString().trim();
    const targetExamRaw = String(row.getCell(5).value ?? "").toString().trim();
    const batchName = String(row.getCell(6).value ?? "").toString().trim();
    const parentName = String(row.getCell(7).value ?? "").toString().trim() || null;
    const parentPhone = String(row.getCell(8).value ?? "").toString().trim() || null;
    const parentEmail = String(row.getCell(9).value ?? "").toString().trim() || null;
    const address = String(row.getCell(10).value ?? "").toString().trim() || null;
    const dobCell = row.getCell(11).value;

    // Skip row if all non-serial cells are empty
    if (
      !name &&
      !email &&
      !rollNo &&
      !targetExamRaw &&
      !batchName &&
      !parentName &&
      !parentPhone &&
      !parentEmail &&
      !address &&
      (dobCell == null || dobCell === "")
    ) {
      continue;
    }

    // Required validations
    if (!name) errors.push({ row: rowIndex, field: "name", reason: "Full Name is required" });
    if (!email) {
      errors.push({ row: rowIndex, field: "email", reason: "Email is required" });
    } else {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        errors.push({ row: rowIndex, field: "email", reason: "Invalid email format" });
      }
    }
    if (!rollNo) errors.push({ row: rowIndex, field: "rollNo", reason: "Roll No is required" });

    let targetExam: ExamType | null = null;
    if (!targetExamRaw) {
      errors.push({ row: rowIndex, field: "targetExam", reason: "Target Exam is required" });
    } else {
      const normalized = targetExamRaw.trim().toUpperCase();
      if (normalized === "JEE" || normalized === "NEET") {
        targetExam = normalized as ExamType;
      } else {
        errors.push({
          row: rowIndex,
          field: "targetExam",
          reason: 'Target Exam must be "JEE" or "NEET"',
        });
      }
    }

    if (rollNo) {
      if (seenRollNos.has(rollNo)) {
        errors.push({
          row: rowIndex,
          field: "rollNo",
          reason: "Duplicate Roll No within uploaded file",
        });
      } else {
        seenRollNos.add(rollNo);
      }
    }

    const dob = parseDob(dobCell, rowIndex, errors);

    if (!name || !email || !rollNo || !targetExam) {
      // Skip pushing incomplete row but continue collecting errors
      continue;
    }

    rows.push({
      name,
      email,
      rollNo,
      targetExam,
      batchName: batchName || undefined,
      parentName,
      parentPhone,
      parentEmail,
      address,
      dob: dob ?? null,
    });
  }

  // DB-level rollNo uniqueness
  const rollNos = rows.map((r) => r.rollNo);
  if (rollNos.length > 0) {
    const existingStudents = await prisma.student.findMany({
      where: {
        rollNo: { in: rollNos },
      },
      select: { rollNo: true },
    });
    const existingRolls = new Set(existingStudents.map((s) => s.rollNo));
    rows.forEach((r, idx) => {
      if (existingRolls.has(r.rollNo)) {
        errors.push({
          row: 6 + idx,
          field: "rollNo",
          reason: `Roll No "${r.rollNo}" already exists`,
        });
      }
    });
  }

  // Validate batch names (if provided)
  const batchNames = Array.from(
    new Set(
      rows
        .map((r) => r.batchName?.trim())
        .filter((n): n is string => !!n)
    )
  );
  const batchMapByName = new Map<string, string>();
  if (batchNames.length > 0) {
    const batches = await prisma.batch.findMany({
      where: {
        name: { in: batchNames },
      },
      select: { id: true, name: true },
    });
    batches.forEach((b) => batchMapByName.set(b.name, b.id));
  }

  rows.forEach((r, idx) => {
    if (r.batchName) {
      if (!batchMapByName.has(r.batchName)) {
        errors.push({
          row: 6 + idx,
          field: "batchName",
          reason: `Batch "${r.batchName}" not found`,
        });
      }
    }
  });

  // If any errors, return them; caller will abort
  return { rows, errors };
}

async function parseFacultySheet(
  worksheet: ExcelJS.Worksheet
): Promise<{
  rows: {
    name: string;
    email: string;
    title?: string | null;
    department?: string | null;
  }[];
  errors: RowError[];
}> {
  const errors: RowError[] = [];

  // Headers in row 4
  const headerRow = worksheet.getRow(4);
  const headers: string[] = [];
  for (let col = 1; col <= headerRow.cellCount; col++) {
    headers.push(normalizeHeader(headerRow.getCell(col).value));
  }

  const expectedHeaders = ["#", "Full Name", "Email", "Title", "Department"];

  const trimmedHeaders = headers.slice(0, expectedHeaders.length);
  const headersMatch =
    trimmedHeaders.length === expectedHeaders.length &&
    trimmedHeaders.every((h, idx) => h === expectedHeaders[idx]);

  if (!headersMatch) {
    throw new ValidationError('Faculty sheet headers do not match the expected format');
  }

  const rows: {
    name: string;
    email: string;
    title?: string | null;
    department?: string | null;
  }[] = [];

  // Data rows 6 to 105
  for (let rowIndex = 6; rowIndex <= 105; rowIndex++) {
    const row = worksheet.getRow(rowIndex);

    const name = String(row.getCell(2).value ?? "").toString().trim();
    const email = String(row.getCell(3).value ?? "").toString().trim();
    const title = String(row.getCell(4).value ?? "").toString().trim() || null;
    const department = String(row.getCell(5).value ?? "").toString().trim() || null;

    // Skip row if all non-serial cells are empty
    if (!name && !email && !title && !department) {
      continue;
    }

    if (!name) errors.push({ row: rowIndex, field: "name", reason: "Full Name is required" });
    if (!email) {
      errors.push({ row: rowIndex, field: "email", reason: "Email is required" });
    } else {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        errors.push({ row: rowIndex, field: "email", reason: "Invalid email format" });
      }
    }

    if (!name || !email) {
      continue;
    }

    rows.push({
      name,
      email,
      title,
      department,
    });
  }

  return { rows, errors };
}

export const POST = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { id: batchId } = batchIdParamSchema.parse(await params);

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    throw new ValidationError("No Excel file uploaded");
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const studentsSheet = getWorksheetByName(workbook, "Students");
  const facultySheet = getWorksheetByName(workbook, "Faculty");

  const { rows: studentRows, errors: studentErrors } = await parseStudentsSheet(studentsSheet, batchId);
  const { rows: facultyRows, errors: facultyErrors } = await parseFacultySheet(facultySheet);

  const allErrors: RowError[] = [...studentErrors, ...facultyErrors];

  if (allErrors.length > 0) {
    throw new ValidationError("Bulk import validation failed", allErrors);
  }

  // All validations passed – perform DB writes in a single transaction (no partial writes)
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // Students
    for (const row of studentRows) {
      const user = await tx.user.create({
        data: {
          name: row.name,
          email: row.email,
          emailVerified: false,
          role: RoleEnum.STUDENT,
          createdAt: now,
          updatedAt: now,
        },
      });

      const batchIdForStudent =
        row.batchName && (await tx.batch.findFirst({ where: { name: row.batchName }, select: { id: true } }))
          ? (await tx.batch.findFirst({ where: { name: row.batchName }, select: { id: true } }))!.id
          : batchId;

      await tx.student.create({
        data: {
          userId: user.id,
          rollNo: row.rollNo,
          targetExam: row.targetExam,
          batchId: batchIdForStudent,
          parentName: row.parentName,
          parentPhone: row.parentPhone,
          parentEmail: row.parentEmail,
          address: row.address,
          dob: row.dob ?? null,
        },
      });
    }

    // Faculty
    for (const row of facultyRows) {
      const user = await tx.user.create({
        data: {
          name: row.name,
          email: row.email,
          emailVerified: false,
          role: RoleEnum.FACULTY,
          createdAt: now,
          updatedAt: now,
        },
      });

      const faculty = await tx.faculty.create({
        data: {
          userId: user.id,
          title: row.title,
          department: row.department,
        },
      });

      // Link faculty to this batch
      await tx.batchFaculty.create({
        data: {
          batchId,
          facultyId: faculty.id,
        },
      });
    }
  });

  return ApiResponse.created(
    {
      studentsImported: studentRows.length,
      facultyImported: facultyRows.length,
    },
    "Students and faculties imported successfully"
  );
});

