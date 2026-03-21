import prisma from "@/lib/prisma";
import { computeAndUpsertWeakAreas } from "@/repositories/weak-area.repository";

async function main() {
    const students = await prisma.student.findMany({ select: { id: true } });
    console.log(`Backfilling ${students.length} students...`);

    for (const student of students) {
        try {
            await computeAndUpsertWeakAreas(student.id);
            console.log(`✓ ${student.id}`);
        } catch (err) {
            console.error(`✗ ${student.id}`, err);
        }
    }

    console.log("Done.");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Backfill failed:", err);
        process.exit(1);
    });
