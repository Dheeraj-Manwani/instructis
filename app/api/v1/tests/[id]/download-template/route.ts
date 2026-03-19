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
import prisma from "@/lib/prisma";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const { id: testId } = testIdParamSchema.parse(await params);

    const includeStudentsParam = req.nextUrl.searchParams.get("includeStudents");
    const includeStudents = includeStudentsParam !== "false";
    const templateTypeParam = req.nextUrl.searchParams.get("templateType");
    const templateType = templateTypeParam === "question-answers" ? "question-answers" : "subject-marks";

    // Fetch test data to get batch info and marks
    // Note: getTestById returns MockTestListItem but actually includes subject marks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const test = (await mockTestService.getTestById(testId)) as any;

    if (!test.batchId) {
        return ApiResponse.error("Test is not associated with a batch", 400);
    }

    // Fetch batch to get exam type
    const batch = await batchRepository.getBatchByIdOrThrow(test.batchId);

    // Determine template URL based on template type / exam type
    let templateUrl: string | undefined;
    if (templateType === "question-answers") {
        templateUrl = process.env.ATTEMPT_TEMPLATE_URL;
    } else if (batch.examType === ExamType.JEE) {
        templateUrl = process.env.JEE_TEMPLATE_URL;
    } else if (batch.examType === ExamType.NEET) {
        templateUrl = process.env.NEET_TEMPLATE_URL;
    }

    if (!templateUrl) {
        return ApiResponse.error(
            templateType === "question-answers"
                ? "Attempt template URL not configured"
                : `Template URL not configured for ${batch.examType}`,
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

    // Get first worksheet
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
        return ApiResponse.error("Template worksheet not found", 500);
    }

    if (templateType === "subject-marks" && batch.examType === ExamType.JEE) {
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
    } else if (templateType === "subject-marks" && batch.examType === ExamType.NEET) {
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

    if (includeStudents && templateType === "subject-marks") {
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
    }

    if (templateType === "question-answers") {
        const referenceSheet = workbook.worksheets[1];
        if (!referenceSheet) {
            return ApiResponse.error("Question ID Reference sheet not found in attempt template", 500);
        }

        const [students, testQuestions] = await Promise.all([
            batchService.getStudentsInBatch(test.batchId),
            prisma.mockTestQuestion.findMany({
                where: { mockTestId: testId },
                select: {
                    questionId: true,
                    orderIndex: true,
                    question: {
                        select: {
                            id: true,
                            text: true,
                            subject: true,
                            difficulty: true,
                            topic: { select: { name: true } },
                            options: {
                                orderBy: { orderIndex: "asc" },
                                select: {
                                    text: true,
                                    isCorrect: true,
                                    orderIndex: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { orderIndex: "asc" },
            }),
        ]);

        // Fill Sheet 2 (Question ID Reference), starting row 4
        const refStartRow = 4;
        testQuestions.forEach((q, index) => {
            const row = referenceSheet.getRow(refStartRow + index);
            const options = q.question.options;
            const optionByIndex = (idx: number) => options.find((o) => o.orderIndex === idx)?.text ?? "";
            const correct = options.find((o) => o.isCorrect);
            const correctOptionKey =
                correct && correct.orderIndex >= 1 && correct.orderIndex <= 4
                    ? String.fromCharCode(96 + correct.orderIndex)
                    : "";

            row.getCell(1).value = index + 1;
            row.getCell(2).value = q.questionId;
            row.getCell(3).value = q.question.subject;
            row.getCell(4).value = q.question.topic?.name ?? "";
            row.getCell(5).value = q.question.difficulty;
            row.getCell(6).value = q.question.text.slice(0, 100);
            row.getCell(7).value = optionByIndex(1);
            row.getCell(8).value = optionByIndex(2);
            row.getCell(9).value = optionByIndex(3);
            row.getCell(10).value = optionByIndex(4);
            row.getCell(11).value = correctOptionKey;
        });

        // Fill Sheet 1 (Question Answers), rows 6-2005 max = 2000 rows
        // Each row is student x question pair.
        if (includeStudents) {
            const dataStartRow = 6;
            const maxRows = 2000;
            let serial = 1;
            let currentRowIndex = dataStartRow;

            for (const student of students) {
                for (const q of testQuestions) {
                    if (currentRowIndex > dataStartRow + maxRows - 1) break;
                    const row = worksheet.getRow(currentRowIndex);
                    row.getCell(1).value = serial;
                    row.getCell(2).value = student.rollNo;
                    row.getCell(3).value = student.user.name;
                    row.getCell(4).value = q.questionId;
                    // Column E is Selected Option, intentionally left blank
                    serial += 1;
                    currentRowIndex += 1;
                }
                if (currentRowIndex > dataStartRow + maxRows - 1) break;
            }
        }
    }

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the file
    return new Response(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${test.name}_${templateType}_template.xlsx"`,
        },
    });
});
