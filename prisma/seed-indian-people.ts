import { ExamType, PrismaClient, RoleEnum } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const INDIAN_STUDENT_NAMES = [
  "Aarav Sharma",
  "Vivaan Patel",
  "Aditya Verma",
  "Ishaan Gupta",
  "Rohan Nair",
  "Ananya Iyer",
  "Diya Singh",
  "Priya Menon",
  "Sneha Reddy",
  "Kavya Joshi",
] as const;

const INDIAN_FACULTY_NAMES = [
  "Dr. Rajesh Kumar",
  "Prof. Meera Nair",
  "Dr. Sandeep Banerjee",
  "Prof. Anjali Deshmukh",
  "Dr. Vivek Chawla",
] as const;

function toEmail(name: string, prefix: "student" | "faculty", index: number) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.)|(\.$)/g, "");
  return `${prefix}.${index + 1}.${slug}@example.com`;
}

async function seedStudents() {
  for (let index = 0; index < INDIAN_STUDENT_NAMES.length; index += 1) {
    const name = INDIAN_STUDENT_NAMES[index];
    const email = toEmail(name, "student", index);
    const rollNo = `IND${(index + 1).toString().padStart(4, "0")}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: RoleEnum.STUDENT,
      },
      create: {
        id: randomUUID(),
        name,
        email,
        emailVerified: false,
        role: RoleEnum.STUDENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.student.upsert({
      where: { rollNo },
      update: {
        userId: user.id,
        targetExam: index % 2 === 0 ? ExamType.JEE : ExamType.NEET,
        parentName: `Parent of ${name}`,
        parentPhone: `98${(index + 1).toString().padStart(8, "0")}`,
        parentEmail: `parent.${index + 1}.${email}`,
      },
      create: {
        userId: user.id,
        rollNo,
        targetExam: index % 2 === 0 ? ExamType.JEE : ExamType.NEET,
        parentName: `Parent of ${name}`,
        parentPhone: `98${(index + 1).toString().padStart(8, "0")}`,
        parentEmail: `parent.${index + 1}.${email}`,
      },
    });
  }
}

async function seedFaculties() {
  for (let index = 0; index < INDIAN_FACULTY_NAMES.length; index += 1) {
    const name = INDIAN_FACULTY_NAMES[index];
    const email = toEmail(name, "faculty", index);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: RoleEnum.FACULTY,
      },
      create: {
        id: randomUUID(),
        name,
        email,
        emailVerified: false,
        role: RoleEnum.FACULTY,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.faculty.upsert({
      where: { userId: user.id },
      update: {
        title: name.startsWith("Dr.") ? "Dr." : "Prof.",
        department: "Academic",
      },
      create: {
        userId: user.id,
        facultyCode: `FAC-${(index + 1).toString().padStart(3, "0")}`,
        title: name.startsWith("Dr.") ? "Dr." : "Prof.",
        department: "Academic",
      },
    });
  }
}

async function main() {
  console.log("Seeding Indian students and faculties...");

  await seedStudents();
  await seedFaculties();

  console.log("Seed complete: 10 students and 5 faculties inserted/updated.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
