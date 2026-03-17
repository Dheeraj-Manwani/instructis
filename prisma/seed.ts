import { ExamType, PrismaClient, RoleEnum } from "@prisma/client";

const prisma = new PrismaClient();
/**
 * Seed script to create:
 * - A few batches (JEE & NEET)
 * - A good number of students NOT assigned to any batch
 * - Some students already assigned to batches
 *
 * Run with:
 *   npx ts-node prisma/seed.ts
 * (ensure TS/ts-node is available in your tooling, or transpile to JS first)
 */

async function main() {
    console.log("Seeding data...");

    // Create some batches
    const currentYear = new Date().getFullYear();

    const [jeeBatch, neetBatch] = await Promise.all([
        prisma.batch.upsert({
            where: { id: "seed-jee-batch" },
            update: {},
            create: {
                id: "seed-jee-batch",
                name: "JEE Alpha",
                examType: ExamType.JEE,
                year: currentYear,
                isActive: true,
            },
        }),
        prisma.batch.upsert({
            where: { id: "seed-neet-batch" },
            update: {},
            create: {
                id: "seed-neet-batch",
                name: "NEET Sigma",
                examType: ExamType.NEET,
                year: currentYear,
                isActive: true,
            },
        }),
    ]);

    console.log("Batches created:", jeeBatch.name, neetBatch.name);

    // Helper to create a user + student
    async function createStudent(opts: {
        index: number;
        examType: ExamType;
        batchId?: string | null;
    }) {
        const { index, examType, batchId } = opts;

        const idSuffix = `${examType}-${index.toString().padStart(3, "0")}`;
        const email = `student.${idSuffix.toLowerCase()}@example.com`;
        const rollNo = `${examType === ExamType.JEE ? "J" : "N"}${index
            .toString()
            .padStart(4, "0")}`;

        const user = await prisma.user.create({
            data: {
                id: `user-${idSuffix}`,
                name: `Student ${idSuffix}`,
                email,
                emailVerified: false,
                role: RoleEnum.STUDENT,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        const student = await prisma.student.create({
            data: {
                userId: user.id,
                rollNo,
                targetExam: examType,
                batchId: batchId ?? null,
                parentName: `Parent of ${user.name}`,
                parentPhone: `99999${index.toString().padStart(5, "0")}`,
                parentEmail: `parent.${idSuffix.toLowerCase()}@example.com`,
                address: "123 Dummy Street, Test City",
                dob: new Date(2007, 0, 1),
            },
        });

        return student;
    }

    // Create students WITHOUT any batch (majority)
    const unassignedStudents: Promise<unknown>[] = [];
    for (let i = 1; i <= 60; i++) {
        unassignedStudents.push(
            createStudent({
                index: i,
                examType: i % 2 === 0 ? ExamType.JEE : ExamType.NEET,
                batchId: null,
            })
        );
    }

    // Create a smaller set of students already assigned to batches
    const assignedStudents: Promise<unknown>[] = [];
    for (let i = 1; i <= 20; i++) {
        assignedStudents.push(
            createStudent({
                index: 100 + i,
                examType: ExamType.JEE,
                batchId: jeeBatch.id,
            })
        );
        assignedStudents.push(
            createStudent({
                index: 200 + i,
                examType: ExamType.NEET,
                batchId: neetBatch.id,
            })
        );
    }

    await Promise.all([...unassignedStudents, ...assignedStudents]);

    console.log(
        `Created ${unassignedStudents.length} unassigned students and ${assignedStudents.length} assigned students.`
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

