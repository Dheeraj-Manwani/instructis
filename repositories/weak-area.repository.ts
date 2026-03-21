import { Priority } from "@prisma/client";
import prisma from "@/lib/prisma";

type TopicAgg = {
    topicId: string;
    drawbackPoints: number;
    questionsCount: number;
};

function getPriority(drawbackPoints: number): Priority {
    if (drawbackPoints > 8) return Priority.HIGH;
    if (drawbackPoints >= 4) return Priority.MEDIUM;
    return Priority.LOW;
}

export async function computeAndUpsertWeakAreas(studentId: string): Promise<void> {
    const answers = await prisma.studentAnswer.findMany({
        where: {
            attempt: { studentId },
            question: { topicId: { not: null } },
        },
        include: {
            question: {
                include: { topic: true },
            },
        },
    });

    const topicMap = new Map<string, TopicAgg>();

    for (const answer of answers) {
        const topicId = answer.question.topicId;
        if (!topicId) continue;

        const existing = topicMap.get(topicId) ?? {
            topicId,
            drawbackPoints: 0,
            questionsCount: 0,
        };

        existing.questionsCount += 1;

        if (
            answer.isCorrect === false &&
            answer.marksAwarded != null &&
            answer.marksAwarded < 0
        ) {
            existing.drawbackPoints += Math.abs(answer.marksAwarded);
        }

        topicMap.set(topicId, existing);
    }

    const weakTopics = Array.from(topicMap.values()).filter(
        (topic) => topic.drawbackPoints > 0
    );

    for (const agg of weakTopics) {
        await prisma.weakArea.upsert({
            where: {
                studentId_topicId: {
                    studentId,
                    topicId: agg.topicId,
                },
            },
            update: {
                drawbackPoints: agg.drawbackPoints,
                questionsCount: agg.questionsCount,
                priority: getPriority(agg.drawbackPoints),
            },
            create: {
                studentId,
                topicId: agg.topicId,
                drawbackPoints: agg.drawbackPoints,
                questionsCount: agg.questionsCount,
                priority: getPriority(agg.drawbackPoints),
            },
        });
    }
}
