import ExcelJS from "exceljs";
import { Difficulty, ExamType, SubjectEnum } from "@prisma/client";
import { ValidationError } from "@/lib/utils/errors";
import type { StudentInBatch } from "@/repositories/batch.repository";

type TestQuestion = {
    questionId: string;
    orderIndex: number;
    marks: number;
    negMarks: number;
    question: {
        id: string;
        text: string;
        subject: SubjectEnum;
        difficulty: Difficulty;
        topic: { name: string } | null;
        options: Array<{
            id: string;
            text: string;
            isCorrect: boolean;
            orderIndex: number;
        }>;
    };
};

type AttemptImportContext = {
    examType: ExamType;
    roster: StudentInBatch[];
    testMaxMarks: {
        totalMarks: number;
        totalMarksPhysics?: number | null;
        totalMarksChemistry?: number | null;
        totalMarksMathematics?: number | null;
        totalMarksZoology?: number | null;
        totalMarksBotany?: number | null;
    };
    testQuestions: TestQuestion[];
};

export type ImportedAttempt = {
    studentId: string;
    physicsMarks: number | null;
    chemistryMarks: number | null;
    mathematicsMarks: number | null;
    zoologyMarks: number | null;
    botanyMarks: number | null;
    totalScore: number;
    answers?: Array<{
        questionId: string;
        selectedOptionId: string | null;
        isCorrect: boolean | null;
        marksAwarded: number | null;
    }>;
};

export type ImportTemplateKind = "subject-marks" | "question-answers";

function normalizeCellValue(val: ExcelJS.CellValue | undefined): string {
    if (typeof val === "string") return val.trim();
    if (val == null) return "";
    if (typeof val === "number") return String(val);
    if (typeof val === "object" && val !== null && "text" in val) {
        return String((val as { text: unknown }).text).trim();
    }
    return "";
}

function keyOf(val: string): string {
    return val.trim().toLowerCase().replace(/\s+/g, " ");
}

function getHeadersAtRow(worksheet: ExcelJS.Worksheet, rowIndex: number, colCount: number): string[] {
    const row = worksheet.getRow(rowIndex);
    const headers: string[] = [];
    for (let col = 1; col <= colCount; col++) {
        headers.push(normalizeCellValue(row.getCell(col).value));
    }
    return headers;
}

function detectTemplateKind(workbook: ExcelJS.Workbook): ImportTemplateKind {
    const firstSheet = workbook.worksheets[0];
    if (!firstSheet) {
        throw new ValidationError("Worksheet not found in uploaded file");
    }

    const row4Headers = getHeadersAtRow(firstSheet, 4, 7).map(keyOf);
    const isQuestionAnswer =
        row4Headers[1] === "roll no" &&
        row4Headers[2] === "student name" &&
        row4Headers[3] === "question id" &&
        row4Headers[4] === "selected option";

    if (isQuestionAnswer) return "question-answers";
    return "subject-marks";
}

function parseAndCapMark(
    worksheet: ExcelJS.Worksheet,
    rowIndex: number,
    cellIdx: number,
    label: string,
    maxMark?: number | null
): number {
    const raw = worksheet.getRow(rowIndex).getCell(cellIdx).value;
    const text = normalizeCellValue(raw);
    if (!text) return 0;
    const num = Number(text);
    if (!Number.isFinite(num) || Number.isNaN(num)) {
        throw new ValidationError(`${label} marks must be a numeric value at row ${rowIndex}`);
    }
    if (num < 0) return 0;
    if (maxMark != null && num > maxMark) return maxMark;
    return num;
}

function parseSubjectMarksTemplate(
    worksheet: ExcelJS.Worksheet,
    examType: ExamType,
    rosterByRoll: Map<string, StudentInBatch>,
    testMaxMarks: AttemptImportContext["testMaxMarks"]
): ImportedAttempt[] {
    const headers = getHeadersAtRow(worksheet, 4, examType === ExamType.JEE ? 6 : 7);
    const expectedJee = ["#", "Roll No", "Student Name", "Physics", "Chemistry", "Maths"];
    const expectedNeet = ["#", "Roll No", "Student Name", "Physics", "Chemistry", "Zoology", "Botany"];
    const expected = examType === ExamType.JEE ? expectedJee : expectedNeet;
    if (headers.length !== expected.length || !headers.every((h, i) => h === expected[i])) {
        throw new ValidationError("Template column headers do not match the expected format");
    }

    const parsed: ImportedAttempt[] = [];

    for (let rowIndex = 6; rowIndex <= 2005; rowIndex++) {
        const row = worksheet.getRow(rowIndex);
        const rollNo = normalizeCellValue(row.getCell(2).value);
        const name = normalizeCellValue(row.getCell(3).value);

        if (!rollNo && !name) continue;
        if (!rollNo) throw new ValidationError(`Roll No is required at row ${rowIndex}`);

        const student = rosterByRoll.get(rollNo);
        if (!student) {
            throw new ValidationError(`Roll No "${rollNo}" at row ${rowIndex} does not match any student in this batch`);
        }

        const physicsMarks = parseAndCapMark(worksheet, rowIndex, 4, "Physics", testMaxMarks.totalMarksPhysics);
        const chemistryMarks = parseAndCapMark(worksheet, rowIndex, 5, "Chemistry", testMaxMarks.totalMarksChemistry);

        if (examType === ExamType.JEE) {
            const mathematicsMarks = parseAndCapMark(
                worksheet,
                rowIndex,
                6,
                "Maths",
                testMaxMarks.totalMarksMathematics
            );
            const totalScore = Math.min(
                testMaxMarks.totalMarks,
                physicsMarks + chemistryMarks + mathematicsMarks
            );
            parsed.push({
                studentId: student.id,
                physicsMarks,
                chemistryMarks,
                mathematicsMarks,
                zoologyMarks: null,
                botanyMarks: null,
                totalScore,
            });
        } else {
            const zoologyMarks = parseAndCapMark(
                worksheet,
                rowIndex,
                6,
                "Zoology",
                testMaxMarks.totalMarksZoology
            );
            const botanyMarks = parseAndCapMark(
                worksheet,
                rowIndex,
                7,
                "Botany",
                testMaxMarks.totalMarksBotany
            );
            const totalScore = Math.min(
                testMaxMarks.totalMarks,
                physicsMarks + chemistryMarks + zoologyMarks + botanyMarks
            );
            parsed.push({
                studentId: student.id,
                physicsMarks,
                chemistryMarks,
                mathematicsMarks: null,
                zoologyMarks,
                botanyMarks,
                totalScore,
            });
        }
    }

    return parsed;
}

function parseQuestionAnswerTemplate(
    workbook: ExcelJS.Workbook,
    examType: ExamType,
    rosterByRoll: Map<string, StudentInBatch>,
    testQuestions: TestQuestion[],
    totalMarks: number
): ImportedAttempt[] {
    const answerSheet = workbook.worksheets[0];
    const referenceSheet = workbook.worksheets[1];
    if (!answerSheet) throw new ValidationError("Question Answers sheet not found");
    if (!referenceSheet) throw new ValidationError("Question ID Reference sheet not found");

    const answerHeaders = getHeadersAtRow(answerSheet, 4, 6);
    const expectedAnswers = ["#", "Roll No", "Student Name", "Question ID", "Selected Option", ""];
    for (let i = 0; i < 5; i++) {
        if (answerHeaders[i] !== expectedAnswers[i]) {
            throw new ValidationError("Question Answers sheet headers do not match expected format");
        }
    }

    const referenceHeaders = getHeadersAtRow(referenceSheet, 3, 11);
    const expectedRef = [
        "#",
        "Question ID",
        "Subject",
        "Topic",
        "Difficulty",
        "Preview Text",
        "Option a",
        "Option b",
        "Option c",
        "Option d",
        "Correct Option",
    ];
    if (referenceHeaders.length !== expectedRef.length || !referenceHeaders.every((h, i) => h === expectedRef[i])) {
        throw new ValidationError("Question ID Reference sheet headers do not match expected format");
    }

    const testQuestionMap = new Map<string, TestQuestion>();
    for (const q of testQuestions) {
        testQuestionMap.set(q.questionId, q);
    }

    type StudentAnswerRow = {
        studentId: string;
        questionId: string;
        optionKey: "a" | "b" | "c" | "d" | null;
    };
    const answerRows: StudentAnswerRow[] = [];

    for (let rowIndex = 6; rowIndex <= 2005; rowIndex++) {
        const row = answerSheet.getRow(rowIndex);
        const rollNo = normalizeCellValue(row.getCell(2).value);
        const name = normalizeCellValue(row.getCell(3).value);
        const questionId = normalizeCellValue(row.getCell(4).value);
        const optionText = normalizeCellValue(row.getCell(5).value).toLowerCase();

        if (!rollNo && !name && !questionId && !optionText) continue;
        if (!rollNo) throw new ValidationError(`Roll No is required at row ${rowIndex}`);
        if (!questionId) throw new ValidationError(`Question ID is required at row ${rowIndex}`);

        const student = rosterByRoll.get(rollNo);
        if (!student) {
            throw new ValidationError(`Roll No "${rollNo}" at row ${rowIndex} does not match any student in this batch`);
        }

        const testQuestion = testQuestionMap.get(questionId);
        if (!testQuestion) {
            throw new ValidationError(`Question ID "${questionId}" at row ${rowIndex} does not belong to this test`);
        }

        let optionKey: "a" | "b" | "c" | "d" | null = null;
        if (optionText) {
            if (!["a", "b", "c", "d"].includes(optionText)) {
                throw new ValidationError(`Selected Option must be a/b/c/d at row ${rowIndex}`);
            }
            optionKey = optionText as "a" | "b" | "c" | "d";
        }

        answerRows.push({
            studentId: student.id,
            questionId,
            optionKey,
        });
    }

    type Aggregate = {
        physics: number;
        chemistry: number;
        mathematics: number;
        zoology: number;
        botany: number;
        answers: ImportedAttempt["answers"];
    };
    const aggregateByStudent = new Map<string, Aggregate>();

    for (const row of answerRows) {
        const question = testQuestionMap.get(row.questionId);
        if (!question) continue;

        const optionsByKey = new Map<"a" | "b" | "c" | "d", TestQuestion["question"]["options"][number]>();
        for (const opt of question.question.options) {
            if (opt.orderIndex >= 1 && opt.orderIndex <= 4) {
                const key = String.fromCharCode(96 + opt.orderIndex) as "a" | "b" | "c" | "d";
                optionsByKey.set(key, opt);
            }
        }

        const selectedOption = row.optionKey ? optionsByKey.get(row.optionKey) : null;
        const correctOption = question.question.options.find((o) => o.isCorrect) ?? null;
        const isCorrect = selectedOption && correctOption ? selectedOption.id === correctOption.id : false;
        let marksAwarded = 0;
        if (!selectedOption) {
            marksAwarded = 0;
        } else if (isCorrect) {
            marksAwarded = question.marks;
        } else {
            marksAwarded = -Math.abs(question.negMarks);
        }

        const current = aggregateByStudent.get(row.studentId) ?? {
            physics: 0,
            chemistry: 0,
            mathematics: 0,
            zoology: 0,
            botany: 0,
            answers: [],
        };

        if (question.question.subject === SubjectEnum.PHYSICS) current.physics += marksAwarded;
        if (question.question.subject === SubjectEnum.CHEMISTRY) current.chemistry += marksAwarded;
        if (question.question.subject === SubjectEnum.MATHEMATICS) current.mathematics += marksAwarded;
        if (question.question.subject === SubjectEnum.ZOOLOGY) current.zoology += marksAwarded;
        if (question.question.subject === SubjectEnum.BOTANY) current.botany += marksAwarded;

        current.answers?.push({
            questionId: row.questionId,
            selectedOptionId: selectedOption?.id ?? null,
            isCorrect: selectedOption ? isCorrect : null,
            marksAwarded,
        });
        aggregateByStudent.set(row.studentId, current);
    }

    const imported: ImportedAttempt[] = [];
    for (const [studentId, agg] of aggregateByStudent.entries()) {
        const physics = Math.max(0, agg.physics);
        const chemistry = Math.max(0, agg.chemistry);
        const mathematics = Math.max(0, agg.mathematics);
        const zoology = Math.max(0, agg.zoology);
        const botany = Math.max(0, agg.botany);
        const rawTotal = physics + chemistry + mathematics + zoology + botany;
        const cappedTotal = Math.min(totalMarks, rawTotal);

        imported.push({
            studentId,
            physicsMarks: physics,
            chemistryMarks: chemistry,
            mathematicsMarks: examType === ExamType.JEE ? mathematics : null,
            zoologyMarks: examType === ExamType.NEET ? zoology : null,
            botanyMarks: examType === ExamType.NEET ? botany : null,
            totalScore: cappedTotal,
            answers: agg.answers ?? [],
        });
    }

    return imported;
}

export async function parseImportedAttemptsFromWorkbook(
    buffer: ArrayBuffer,
    context: AttemptImportContext,
    forcedTemplateKind?: ImportTemplateKind
): Promise<{ templateKind: ImportTemplateKind; attempts: ImportedAttempt[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const templateKind = forcedTemplateKind ?? detectTemplateKind(workbook);
    const rosterByRoll = new Map<string, StudentInBatch>();
    for (const s of context.roster) {
        rosterByRoll.set((s.rollNo || "").trim(), s);
    }

    if (templateKind === "question-answers") {
        return {
            templateKind,
            attempts: parseQuestionAnswerTemplate(
                workbook,
                context.examType,
                rosterByRoll,
                context.testQuestions,
                context.testMaxMarks.totalMarks
            ),
        };
    }

    const firstSheet = workbook.worksheets[0];
    if (!firstSheet) {
        throw new ValidationError("Worksheet not found in uploaded file");
    }

    return {
        templateKind,
        attempts: parseSubjectMarksTemplate(
            firstSheet,
            context.examType,
            rosterByRoll,
            context.testMaxMarks
        ),
    };
}
