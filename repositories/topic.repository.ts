import type { SubjectEnum } from "@prisma/client";
import prisma from "@/lib/prisma";

export type TopicListItem = {
  id: string;
  name: string;
  subject: SubjectEnum;
};

export async function findManyTopicsBySubject(
  subject: SubjectEnum
): Promise<TopicListItem[]> {
  const topics = await prisma.topic.findMany({
    where: { subject },
    orderBy: { name: "asc" },
  });
  return topics.map((t) => ({ id: t.id, name: t.name, subject: t.subject }));
}

export async function createTopic(data: {
  name: string;
  subject: SubjectEnum;
}): Promise<TopicListItem> {
  const topic = await prisma.topic.create({
    data,
  });
  return { id: topic.id, name: topic.name, subject: topic.subject };
}
