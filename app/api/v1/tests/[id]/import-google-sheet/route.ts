import { NextRequest } from "next/server";

import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import { testIdParamSchema, importGoogleSheetBodySchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import * as batchService from "@/services/batch.service";
import { ExamType } from "@prisma/client";
import type { StudentInBatch } from "@/repositories/batch.repository";
import ExcelJS from "exceljs";

function normalizeHeader(val: ExcelJS.CellValue | undefined): string {
    if (typeof val === "string") return val.trim();
    if (val == null) return "";
    if (typeof val === "number") return String(val);
    if (typeof val === "object" && "text" in (val as any)) {
        return String((val as any).text).trim();
    }
    return "";
}

type ParsedRow =
    | {
        student: StudentInBatch;
        physics: number;
        chemistry: number;
        mathematics: number | null;
        zoology: number | null;
        botany: number | null;
    }
    | undefined;

type TestMaxMarks = {
    totalMarks: number;
    totalMarksPhysics?: number | null;
    totalMarksChemistry?: number | null;
    totalMarksMathematics?: number | null;
    totalMarksZoology?: number | null;
    totalMarksBotany?: number | null;
};

async function parseAndValidateWorkbook(
    buffer: ArrayBuffer,
    examType: ExamType,
    roster: StudentInBatch[],
    testMaxMarks: TestMaxMarks
): Promise<ParsedRow[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        throw new ValidationError("Worksheet not found in uploaded file");
    }

    // Validate headers in row 4 (1-based index)
    const headerRow = worksheet.getRow(4);
    const headers: string[] = [];
    for (let col = 1; col <= headerRow.cellCount; col++) {
        headers.push(normalizeHeader(headerRow.getCell(col).value));
    }

    // We strictly validate all data columns but ignore the last "auto-sum" header
    const expectedHeadersJEE = ["#", "Roll No", "Student Name", "Physics", "Chemistry", "Maths"];
    const expectedHeadersNEET = ["#", "Roll No", "Student Name", "Physics", "Chemistry", "Zoology", "Botany"];

    const expectedHeaders = examType === ExamType.JEE ? expectedHeadersJEE : expectedHeadersNEET;

    const trimmedHeaders = headers.slice(0, expectedHeaders.length);
    const headersMatch =
        trimmedHeaders.length === expectedHeaders.length &&
        trimmedHeaders.every((h, idx) => h === expectedHeaders[idx]);

    if (!headersMatch) {
        throw new ValidationError("Template column headers do not match the expected format");
    }

    // Map rollNo -> student
    const rosterByRoll = new Map<string, StudentInBatch>();
    for (const s of roster) {
        rosterByRoll.set((s.rollNo || "").trim(), s);
    }

    const parsedRows: ParsedRow[] = [];

    // Student rows are from row 6 (index 6) to row 105 (inclusive)
    for (let rowIndex = 6; rowIndex <= 105; rowIndex++) {
        const row = worksheet.getRow(rowIndex);

        const rollNo = normalizeHeader(row.getCell(2).value);
        const name = normalizeHeader(row.getCell(3).value);

        // Skip completely empty slots
        if (!rollNo && !name) {
            parsedRows.push(undefined);
            continue;
        }

        if (!rollNo) {
            throw new ValidationError(`Roll No is required at row ${rowIndex}`);
        }

        const student = rosterByRoll.get(rollNo);
        if (!student) {
            throw new ValidationError(`Roll No "${rollNo}" at row ${rowIndex} does not match any student in this batch`);
        }

        const parseMark = (cellIdx: number, label: string, maxMark?: number | null): number => {
            const raw = row.getCell(cellIdx).value;
            const text = normalizeHeader(raw);
            if (!text) {
                // Treat empty as 0 marks (not attempted)
                return 0;
            }
            const num = Number(text);
            if (!Number.isFinite(num) || Number.isNaN(num)) {
                throw new ValidationError(`${label} marks must be a numeric value at row ${rowIndex}`);
            }
            // Treat negative as zero
            if (num < 0) return 0;
            // Treat above max marks for subject as full marks (cap at max)
            if (maxMark != null && num > maxMark) return maxMark;
            return num;
        };

        const physics = parseMark(4, "Physics", testMaxMarks.totalMarksPhysics);
        const chemistry = parseMark(5, "Chemistry", testMaxMarks.totalMarksChemistry);

        if (examType === ExamType.JEE) {
            const mathematics = parseMark(6, "Maths", testMaxMarks.totalMarksMathematics);
            parsedRows.push({
                student,
                physics,
                chemistry,
                mathematics,
                zoology: null,
                botany: null,
            });
        } else {
            const zoology = parseMark(6, "Zoology", testMaxMarks.totalMarksZoology);
            const botany = parseMark(7, "Botany", testMaxMarks.totalMarksBotany);
            parsedRows.push({
                student,
                physics,
                chemistry,
                mathematics: null,
                zoology,
                botany,
            });
        }
    }

    return parsedRows;
}

export const POST = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id: testId } = testIdParamSchema.parse(await params);
    const { url } = await withValidation(req, importGoogleSheetBodySchema);

    // Google Sheets export URL is expected to return an xlsx file
    const response = await fetch(url);
    if (!response.ok) {
        throw new ValidationError("Failed to download Google Sheet. Please check that the URL is correct and publicly accessible.");
    }

    const arrayBuffer = await response.arrayBuffer();

    // Get test and batch
    const test = (await mockTestService.getTestById(testId)) as any;
    if (!test.batchId) {
        throw new ValidationError("Test is not associated with a batch");
    }

    const batch = await batchService.getBatchById(test.batchId);
    const roster = await batchService.getStudentsInBatch(test.batchId);

    const parsedRows = await parseAndValidateWorkbook(arrayBuffer, batch.examType, roster, test);

    const createdOrUpdated = [];

    for (const row of parsedRows) {
        if (!row) continue;

        let totalScore =
            (row.physics ?? 0) +
            (row.chemistry ?? 0) +
            (row.mathematics ?? 0) +
            (row.zoology ?? 0) +
            (row.botany ?? 0);
        // Cap total at test total marks (treat excess as full marks)
        if (totalScore > test.totalMarks) totalScore = test.totalMarks;

        const attempt = await mockTestService.createOrUpdateTestAttempt({
            studentId: row.student.id,
            mockTestId: testId,
            physicsMarks: row.physics,
            chemistryMarks: row.chemistry,
            mathematicsMarks: row.mathematics,
            zoologyMarks: row.zoology,
            botanyMarks: row.botany,
            totalScore,
        });

        createdOrUpdated.push(attempt);
    }

    return ApiResponse.created(createdOrUpdated, "Test attempts imported from Google Sheets successfully");
});

