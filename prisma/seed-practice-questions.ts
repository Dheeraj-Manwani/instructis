import { Difficulty, PrismaClient, SubjectEnum } from "@prisma/client";

const prisma = new PrismaClient();

const DIFFICULTIES: Difficulty[] = ["EASY", "MODERATE", "HARD"];

function subjectLabel(subject: SubjectEnum): string {
  switch (subject) {
    case "PHYSICS":
      return "Physics";
    case "CHEMISTRY":
      return "Chemistry";
    case "MATHEMATICS":
      return "Mathematics";
    case "ZOOLOGY":
      return "Zoology";
    case "BOTANY":
      return "Botany";
    default:
      return subject;
  }
}

function buildQuestionText(topicName: string, subject: SubjectEnum, difficulty: Difficulty, index: number): string {
  const label = subjectLabel(subject);
  const qNo = index + 1;
  return `Practice Q${qNo} (${difficulty}) - ${label}: ${topicName}`;
}

function buildOptions(topicName: string, index: number) {
  const correct = `Core concept of ${topicName}`;
  return [
    { text: correct, isCorrect: true, orderIndex: 1 },
    { text: `Distractor ${index + 1}A`, isCorrect: false, orderIndex: 2 },
    { text: `Distractor ${index + 1}B`, isCorrect: false, orderIndex: 3 },
    { text: `Distractor ${index + 1}C`, isCorrect: false, orderIndex: 4 },
  ];
}

async function main() {
  console.log("Seeding practice questions...");

  const faculty = await prisma.faculty.findFirst({
    select: { id: true, user: { select: { name: true } } },
    orderBy: { id: "asc" },
  });

  if (!faculty) {
    throw new Error("No faculty found. Create at least one faculty before seeding practice questions.");
  }

  const topics = await prisma.topic.findMany({
    select: { id: true, name: true, subject: true },
    orderBy: [{ subject: "asc" }, { name: "asc" }],
  });

  if (topics.length === 0) {
    throw new Error("No topics found in DB. Seed topics before seeding practice questions.");
  }

  console.log(`Found ${topics.length} topics. Replacing existing practice questions for these topics...`);

  await prisma.question.deleteMany({
    where: {
      isPractice: true,
      topicId: { in: topics.map((topic) => topic.id) },
    },
  });

  let createdCount = 0;

  for (const topic of topics) {
    for (let i = 0; i < 3; i++) {
      const difficulty = DIFFICULTIES[i]!;

      await prisma.question.create({
        data: {
          text: buildQuestionText(topic.name, topic.subject, difficulty, i),
          type: "MCQ",
          difficulty,
          subject: topic.subject,
          topicId: topic.id,
          facultyId: faculty.id,
          explanation: `Practice question for ${topic.name} (${difficulty}).`,
          isPublished: true,
          isPractice: true,
          options: {
            create: buildOptions(topic.name, i),
          },
        },
      });

      createdCount += 1;
    }
  }

  console.log(
    `Practice questions seed complete. Created ${createdCount} questions across ${topics.length} topics using faculty ${faculty.user.name}.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
