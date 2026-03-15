import type { SubjectEnum } from "@prisma/client";
import * as topicRepository from "@/repositories/topic.repository";

export async function listTopicsBySubject(
  subject: SubjectEnum
): Promise<topicRepository.TopicListItem[]> {
  return topicRepository.findManyTopicsBySubject(subject);
}

export type CreateTopicInput = {
  name: string;
  subject: SubjectEnum;
};

export async function createTopic(data: CreateTopicInput) {
  return topicRepository.createTopic(data);
}
