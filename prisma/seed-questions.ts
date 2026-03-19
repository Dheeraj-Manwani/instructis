import { PrismaClient } from "@prisma/client";
import questions from "./data";

const prisma = new PrismaClient();

type SeedQuestion = {
    text: string;
    subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
    difficulty: "EASY" | "MODERATE" | "HARD";
    type: "MCQ" | "NUMERICAL" | "MULTI_CORRECT";
    explanation?: string;
    options?: Array<{ text: string; isCorrect: boolean }>;
};

async function main() {
    console.log("Seeding questions from prisma/data.ts...");

    const faculty = await prisma.faculty.findFirst({
        select: { id: true, user: { select: { name: true } } },
        orderBy: { id: "asc" },
    });

    if (!faculty) {
        throw new Error("No faculty found. Create at least one faculty before seeding questions.");
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const rawQuestion of questions as SeedQuestion[]) {
        const existing = await prisma.question.findFirst({
            where: {
                facultyId: faculty.id,
                text: rawQuestion.text,
            },
            select: { id: true },
        });

        if (existing) {
            skippedCount += 1;
            continue;
        }

        await prisma.question.create({
            data: {
                text: rawQuestion.text,
                subject: rawQuestion.subject,
                difficulty: rawQuestion.difficulty,
                type: rawQuestion.type,
                explanation: rawQuestion.explanation ?? null,
                isPublished: true,
                facultyId: faculty.id,
                options: rawQuestion.options?.length
                    ? {
                        create: rawQuestion.options.map((option, index) => ({
                            text: option.text,
                            isCorrect: option.isCorrect,
                            orderIndex: index + 1,
                        })),
                    }
                    : undefined,
            },
        });

        createdCount += 1;
    }

    console.log(
        `Questions seed complete. Created: ${createdCount}, skipped (already present): ${skippedCount}, faculty: ${faculty.user.name}`
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
