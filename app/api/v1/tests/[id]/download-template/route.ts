import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { testIdParamSchema } from "@/lib/schemas/mock-test.schema";
import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { ExamType } from "@prisma/client";
import * as mockTestService from "@/services/mock-test.service";
import * as batchRepository from "@/repositories/batch.repository";
import * as batchService from "@/services/batch.service";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id: testId } = testIdParamSchema.parse(await params);

    // const includeStudentsParam = req.nextUrl.searchParams.get("includeStudents");
    // const includeStudents = includeStudentsParam !== "false";

    // Fetch test data to get batch info and marks
    // Note: getTestById returns MockTestListItem but actually includes subject marks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const test = (await mockTestService.getTestById(testId)) as any;

    if (!test.batchId) {
        return ApiResponse.error("Test is not associated with a batch", 400);
    }

    // Fetch batch to get exam type
    const batch = await batchRepository.getBatchByIdOrThrow(test.batchId);

    // Determine template URL based on exam type
    let templateUrl: string | undefined;
    if (batch.examType === ExamType.JEE) {
        templateUrl = process.env.JEE_TEMPLATE_URL;
    } else if (batch.examType === ExamType.NEET) {
        templateUrl = process.env.NEET_TEMPLATE_URL;
    }

    if (!templateUrl) {
        return ApiResponse.error(
            `Template URL not configured for ${batch.examType}`,
            503
        );
    }

    // Fetch template from CloudFront
    const response = await fetch(templateUrl);
    if (!response.ok) {
        return ApiResponse.error("Failed to fetch template", 500);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    // Get the first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        return ApiResponse.error("Template worksheet not found", 500);
    }

    // Edit template based on exam type
    if (batch.examType === ExamType.JEE) {
        // D5: Physics total marks
        const physicsMarks = test.totalMarksPhysics || 0;
        const cellD5 = worksheet.getCell("D5");
        cellD5.value = `/ ${physicsMarks} marks`;

        // E5: Chemistry total marks
        const chemistryMarks = test.totalMarksChemistry || 0;
        const cellE5 = worksheet.getCell("E5");
        cellE5.value = `/ ${chemistryMarks} marks`;

        // F5: Mathematics total marks
        const mathematicsMarks = test.totalMarksMathematics || 0;
        const cellF5 = worksheet.getCell("F5");
        cellF5.value = `/ ${mathematicsMarks} marks`;

        // G4: Total marks
        const totalMarks = test.totalMarks || 0;
        const cellG4 = worksheet.getCell("G4");
        cellG4.value = `Total / ${totalMarks} marks`;
    } else if (batch.examType === ExamType.NEET) {
        // D5: Physics total marks
        const physicsMarks = test.totalMarksPhysics || 0;
        const cellD5 = worksheet.getCell("D5");
        cellD5.value = `/ ${physicsMarks} marks`;

        // E5: Chemistry total marks
        const chemistryMarks = test.totalMarksChemistry || 0;
        const cellE5 = worksheet.getCell("E5");
        cellE5.value = `/ ${chemistryMarks} marks`;

        // F5: Mathematics total marks
        const zoologyMarks = test.totalMarksZoology || 0;
        const cellF5 = worksheet.getCell("F5");
        cellF5.value = `/ ${zoologyMarks} marks`;

        // G5: Botany total marks
        const botanyMarks = test.totalMarksBotany || 0;
        const cellG5 = worksheet.getCell("G5");
        cellG5.value = `/ ${botanyMarks} marks`;

        // H4: Total marks
        const totalMarks = test.totalMarks || 0;
        const cellH4 = worksheet.getCell("H4");
        cellH4.value = `Total / ${totalMarks} marks`;
    }

    // if (includeStudents) {
    // Pre-fill student roll numbers and names for this batch
    const students = await batchService.getStudentsInBatch(test.batchId);
    const maxStudents = 100;
    const startRow = 6; // row 6 is the first student row

    students.slice(0, maxStudents).forEach((student, index) => {
        const rowNumber = startRow + index;
        const row = worksheet.getRow(rowNumber);
        // Column B: Roll No, Column C: Student Name
        row.getCell(2).value = student.rollNo;
        row.getCell(3).value = student.user.name;
    });
    // }

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the file
    return new Response(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${test.name}_template.xlsx"`,
        },
    });
});
