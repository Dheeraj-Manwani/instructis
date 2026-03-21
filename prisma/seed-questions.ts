import { PrismaClient } from "@prisma/client";
import questions from "./data";

const prisma = new PrismaClient();

type RawSeedQuestion = {
  text: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
  difficulty: "EASY" | "MODERATE" | "HARD";
  type: "MCQ" | "NUMERICAL" | "MULTI_CORRECT";
  explanation?: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
};

type SeedQuestion = {
  text: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS" | "ZOOLOGY" | "BOTANY";
  difficulty: "EASY" | "MODERATE" | "HARD";
  type: "MCQ";
  explanation?: string;
  options: Array<{ text: string; isCorrect: boolean }>;
};

const TOPICS_BY_SUBJECT: Record<
  RawSeedQuestion["subject"],
  [string, string, string]
> = {
  PHYSICS: ["Kinematics", "Laws of Motion", "Electromagnetism"],
  CHEMISTRY: ["Atomic Structure", "Chemical Bonding", "Mole Concept"],
  MATHEMATICS: ["Differential Calculus", "Integral Calculus", "Coordinate Geometry"],
  ZOOLOGY: ["Human Physiology", "Cell Biology", "Human Health and Disease"],
  BOTANY: ["Plant Physiology", "Plant Anatomy", "Plant Nutrition"],
};

const EXTRA_QUESTIONS: SeedQuestion[] = [
  {
    text: "A car moves with uniform acceleration from rest and reaches 20 m/s in 4 s. Find acceleration.",
    subject: "PHYSICS",
    difficulty: "EASY",
    type: "MCQ",
    explanation: "a = (v-u)/t = (20-0)/4 = 5 m/s²",
    options: [
      { text: "5 m/s²", isCorrect: true },
      { text: "4 m/s²", isCorrect: false },
      { text: "20 m/s²", isCorrect: false },
      { text: "0 m/s²", isCorrect: false },
    ],
  },
  {
    text: "Work done when force and displacement are perpendicular is:",
    subject: "PHYSICS",
    difficulty: "EASY",
    type: "MCQ",
    options: [
      { text: "Zero", isCorrect: true },
      { text: "Maximum", isCorrect: false },
      { text: "Negative", isCorrect: false },
      { text: "Infinite", isCorrect: false },
    ],
  },
  {
    text: "The number of electrons in Mg2+ (atomic number 12) is:",
    subject: "CHEMISTRY",
    difficulty: "EASY",
    type: "MCQ",
    explanation: "Mg has 12 electrons, Mg2+ has lost 2, so 10 electrons.",
    options: [
      { text: "10", isCorrect: true },
      { text: "12", isCorrect: false },
      { text: "14", isCorrect: false },
      { text: "8", isCorrect: false },
    ],
  },
  {
    text: "Which bond is formed by complete transfer of electrons?",
    subject: "CHEMISTRY",
    difficulty: "EASY",
    type: "MCQ",
    options: [
      { text: "Ionic bond", isCorrect: true },
      { text: "Covalent bond", isCorrect: false },
      { text: "Hydrogen bond", isCorrect: false },
      { text: "Metallic bond", isCorrect: false },
    ],
  },
  {
    text: "Derivative of x² with respect to x is:",
    subject: "MATHEMATICS",
    difficulty: "EASY",
    type: "MCQ",
    options: [
      { text: "2x", isCorrect: true },
      { text: "x", isCorrect: false },
      { text: "x²", isCorrect: false },
      { text: "1", isCorrect: false },
    ],
  },
  {
    text: "Evaluate ∫0→2 2x dx.",
    subject: "MATHEMATICS",
    difficulty: "EASY",
    type: "MCQ",
    explanation: "Integral of 2x is x². From 0 to 2 gives 4.",
    options: [
      { text: "4", isCorrect: true },
      { text: "2", isCorrect: false },
      { text: "8", isCorrect: false },
      { text: "1", isCorrect: false },
    ],
  },
  {
    text: "Site of gas exchange in human lungs is:",
    subject: "ZOOLOGY",
    difficulty: "EASY",
    type: "MCQ",
    options: [
      { text: "Alveoli", isCorrect: true },
      { text: "Bronchi", isCorrect: false },
      { text: "Trachea", isCorrect: false },
      { text: "Diaphragm", isCorrect: false },
    ],
  },
  {
    text: "Deficiency of insulin causes:",
    subject: "ZOOLOGY",
    difficulty: "MODERATE",
    type: "MCQ",
    options: [
      { text: "Diabetes mellitus", isCorrect: true },
      { text: "Anemia", isCorrect: false },
      { text: "Goitre", isCorrect: false },
      { text: "Scurvy", isCorrect: false },
    ],
  },
  {
    text: "Opening and closing of stomata is mainly controlled by:",
    subject: "BOTANY",
    difficulty: "MODERATE",
    type: "MCQ",
    options: [
      { text: "Guard cells", isCorrect: true },
      { text: "Xylem vessels", isCorrect: false },
      { text: "Phloem", isCorrect: false },
      { text: "Root hairs", isCorrect: false },
    ],
  },
  {
    text: "The tissue responsible for upward transport of water in plants is:",
    subject: "BOTANY",
    difficulty: "EASY",
    type: "MCQ",
    options: [
      { text: "Xylem", isCorrect: true },
      { text: "Phloem", isCorrect: false },
      { text: "Cambium", isCorrect: false },
      { text: "Epidermis", isCorrect: false },
    ],
  },
];

function inferTopicName(question: RawSeedQuestion): string {
  const text = question.text.toLowerCase();

  if (question.subject === "PHYSICS") {
    if (/(velocity|acceleration|speed|time|kinematics)/.test(text)) return "Kinematics";
    if (/(force|momentum|work|bernoulli|collision)/.test(text)) return "Laws of Motion";
    return "Electromagnetism";
  }

  if (question.subject === "CHEMISTRY") {
    if (/(quantum|orbital|electron|atomic|avogadro|atomic number)/.test(text)) return "Atomic Structure";
    if (/(bond|hydrogen bonding|ionic|covalent)/.test(text)) return "Chemical Bonding";
    return "Mole Concept";
  }

  if (question.subject === "MATHEMATICS") {
    if (/(derivative|sin|cos|tan|function|continuous)/.test(text)) return "Differential Calculus";
    if (/(integral|∫)/.test(text)) return "Integral Calculus";
    return "Coordinate Geometry";
  }

  if (question.subject === "ZOOLOGY") {
    if (/(blood|heart|insulin|hormone|temperature|heartbeat|lungs|respiratory)/.test(text)) {
      return "Human Physiology";
    }
    if (/(cell|tissue|organism)/.test(text)) return "Cell Biology";
    return "Human Health and Disease";
  }

  if (/(photosynthesis|stomata|water movement|chlorophyll|pigment|xylem|phloem)/.test(text)) {
    return "Plant Physiology";
  }
  if (/(tissue|root|stem|leaf|anatomy)/.test(text)) return "Plant Anatomy";
  return "Plant Nutrition";
}

function deriveAnswerFromExplanation(explanation?: string): string {
  if (!explanation) return "Refer to standard formula result";
  const cleaned = explanation.trim();
  if (!cleaned) return "Refer to standard formula result";

  // Prefer the trailing computed result pattern in explanations.
  const rhsMatch = cleaned.match(/(?:=|->|=>|approximately)\s*([^\n,.]+)$/i);
  if (rhsMatch?.[1]?.trim()) return rhsMatch[1].trim();

  // Fallback: first short segment.
  return cleaned.split(/[.]/)[0]?.trim() || "Refer to standard formula result";
}

function toSingleAnswerMcqOptions(question: RawSeedQuestion): Array<{ text: string; isCorrect: boolean }> {
  if (question.options && question.options.length > 0) {
    const normalized = question.options.slice(0, 4).map((opt) => ({
      text: opt.text,
      isCorrect: false,
    }));
    while (normalized.length < 4) {
      normalized.push({ text: `Option ${String.fromCharCode(65 + normalized.length)}`, isCorrect: false });
    }

    const firstCorrectIndex = question.options.findIndex((opt) => opt.isCorrect);
    const safeCorrectIndex = firstCorrectIndex >= 0 ? Math.min(firstCorrectIndex, 3) : 0;
    normalized[safeCorrectIndex]!.isCorrect = true;
    return normalized;
  }

  const answer = deriveAnswerFromExplanation(question.explanation);
  return [
    { text: answer, isCorrect: true },
    { text: "Cannot be determined from given data", isCorrect: false },
    { text: "None of these", isCorrect: false },
    { text: "Data is insufficient", isCorrect: false },
  ];
}

function toMcqSeedQuestion(question: RawSeedQuestion): SeedQuestion {
  return {
    text: question.text,
    subject: question.subject,
    difficulty: question.difficulty,
    type: "MCQ",
    explanation: question.explanation,
    options: toSingleAnswerMcqOptions(question),
  };
}

async function main() {
  console.log("Resetting question bank and seeding fresh questions...");

  const faculty = await prisma.faculty.findFirst({
    select: { id: true, user: { select: { name: true } } },
    orderBy: { id: "asc" },
  });

  if (!faculty) {
    throw new Error("No faculty found. Create at least one faculty before seeding questions.");
  }

  console.log("Deleting existing questions...");
  await prisma.$transaction(async (tx) => {
    await tx.studentAnswer.deleteMany();
    await tx.mockTestQuestion.deleteMany();
    await tx.questionOption.deleteMany();
    await tx.question.deleteMany();
  });

  console.log("Creating topics...");
  const topicIdMap = new Map<string, string>();
  for (const [subject, names] of Object.entries(TOPICS_BY_SUBJECT) as Array<
    [RawSeedQuestion["subject"], string[]]
  >) {
    for (const name of names) {
      const topic = await prisma.topic.upsert({
        where: {
          id: `${subject.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: { name, subject },
        create: {
          id: `${subject.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, "-")}`,
          name,
          subject,
        },
      });
      topicIdMap.set(`${subject}:${name}`, topic.id);
    }
  }

  const allQuestions: SeedQuestion[] = [...(questions as RawSeedQuestion[]), ...EXTRA_QUESTIONS].map(
    toMcqSeedQuestion
  );
  if (allQuestions.length !== 60) {
    throw new Error(`Expected 60 questions, but got ${allQuestions.length}.`);
  }

  console.log("Creating questions...");
  for (const rawQuestion of allQuestions) {
    const topicName = inferTopicName(rawQuestion);
    const topicId = topicIdMap.get(`${rawQuestion.subject}:${topicName}`);

    if (!topicId) {
      throw new Error(`Topic mapping missing for ${rawQuestion.subject} -> ${topicName}`);
    }

    console.log(`Creating question: ${rawQuestion.text}`);
    await prisma.question.create({
      data: {
        text: rawQuestion.text,
        subject: rawQuestion.subject,
        difficulty: rawQuestion.difficulty,
        type: rawQuestion.type,
        explanation: rawQuestion.explanation ?? null,
        isPublished: true,
        facultyId: faculty.id,
        topicId,
        options: {
          create: rawQuestion.options.map((option, index) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            orderIndex: index + 1,
          })),
        },
      },
    });
  }

  console.log(
    `Questions seed complete. Created: ${allQuestions.length}, topics ensured: 15, faculty: ${faculty.user.name}`
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
