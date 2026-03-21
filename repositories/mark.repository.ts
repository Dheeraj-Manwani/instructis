import { ExamType, Prisma, SubjectEnum } from "@prisma/client";
import prisma from "@/lib/prisma";

type AttemptSubjectMarks = {
    physicsMarks?: number | null;
    chemistryMarks?: number | null;
    mathematicsMarks?: number | null;
    zoologyMarks?: number | null;
    botanyMarks?: number | null;
};

type TestSubjectMaxMarks = {
    totalMarks: number;
    totalMarksPhysics?: number | null;
    totalMarksChemistry?: number | null;
    totalMarksMathematics?: number | null;
    totalMarksZoology?: number | null;
    totalMarksBotany?: number | null;
};

export type SyncMarksForAttemptInput = {
    studentId: string;
    facultyId: string;
    batchId?: string | null;
    testName: string;
    examType: ExamType;
    percentile?: number | null;
    attemptMarks: AttemptSubjectMarks;
    testMaxMarks: TestSubjectMaxMarks;
};

const EXAM_SUBJECTS: Record<ExamType, SubjectEnum[]> = {
    JEE: [SubjectEnum.PHYSICS, SubjectEnum.CHEMISTRY, SubjectEnum.MATHEMATICS],
    NEET: [SubjectEnum.PHYSICS, SubjectEnum.CHEMISTRY, SubjectEnum.ZOOLOGY, SubjectEnum.BOTANY],
};

function toScore(value: number | null | undefined): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getSubjectMarks(attemptMarks: AttemptSubjectMarks, subject: SubjectEnum): number | null {
    switch (subject) {
        case SubjectEnum.PHYSICS:
            return toScore(attemptMarks.physicsMarks);
        case SubjectEnum.CHEMISTRY:
            return toScore(attemptMarks.chemistryMarks);
        case SubjectEnum.MATHEMATICS:
            return toScore(attemptMarks.mathematicsMarks);
        case SubjectEnum.ZOOLOGY:
            return toScore(attemptMarks.zoologyMarks);
        case SubjectEnum.BOTANY:
            return toScore(attemptMarks.botanyMarks);
        default:
            return null;
    }
}

function getSubjectMaxMarksFromTest(
    testMaxMarks: TestSubjectMaxMarks,
    subject: SubjectEnum
): number | null {
    switch (subject) {
        case SubjectEnum.PHYSICS:
            return toScore(testMaxMarks.totalMarksPhysics);
        case SubjectEnum.CHEMISTRY:
            return toScore(testMaxMarks.totalMarksChemistry);
        case SubjectEnum.MATHEMATICS:
            return toScore(testMaxMarks.totalMarksMathematics);
        case SubjectEnum.ZOOLOGY:
            return toScore(testMaxMarks.totalMarksZoology);
        case SubjectEnum.BOTANY:
            return toScore(testMaxMarks.totalMarksBotany);
        default:
            return null;
    }
}

function resolveMaxMarks(
    examType: ExamType,
    subject: SubjectEnum,
    marksObtained: number,
    testMaxMarks: TestSubjectMaxMarks
): number {
    const explicitMax = getSubjectMaxMarksFromTest(testMaxMarks, subject);
    if (explicitMax !== null) return explicitMax;

    const subjectsCount = EXAM_SUBJECTS[examType].length;
    if (testMaxMarks.totalMarks > 0) {
        return Number((testMaxMarks.totalMarks / subjectsCount).toFixed(2));
    }

    return marksObtained;
}

export async function syncMarksForAttempt(
    input: SyncMarksForAttemptInput,
    tx?: Prisma.TransactionClient
): Promise<void> {
    const db = tx ?? prisma;

    const subjects = EXAM_SUBJECTS[input.examType];
    for (const subject of subjects) {
        const marksObtained = getSubjectMarks(input.attemptMarks, subject);
        if (marksObtained === null) continue;

        const marksForSubject = await db.mark.findMany({
            where: {
                studentId: input.studentId,
                subject,
                examType: input.examType,
            },
            orderBy: { createdAt: "desc" },
            select: { id: true, testName: true, marksObtained: true },
        });

        const previous = marksForSubject.find((mark) => mark.testName !== input.testName) ?? null;

        const improvement =
            previous && typeof previous.marksObtained === "number"
                ? marksObtained - previous.marksObtained
                : null;

        const existing = marksForSubject.find((mark) => mark.testName === input.testName) ?? null;

        const markData = {
            studentId: input.studentId,
            facultyId: input.facultyId,
            batchId: input.batchId ?? null,
            subject,
            testName: input.testName,
            examType: input.examType,
            marksObtained,
            maxMarks: resolveMaxMarks(input.examType, subject, marksObtained, input.testMaxMarks),
            percentile: input.percentile ?? null,
            improvement,
        };

        if (existing) {
            await db.mark.update({
                where: { id: existing.id },
                data: markData,
            });
        } else {
            await db.mark.create({
                data: markData,
            });
        }
    }
}
