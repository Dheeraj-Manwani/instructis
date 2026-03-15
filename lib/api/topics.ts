import { api } from "./axios";

export type TopicListItem = {
  id: string;
  name: string;
  subject: string;
};

export async function fetchTopicsBySubject(
  subject: string
): Promise<TopicListItem[]> {
  const res = (await api.get("/topics", { params: { subject } })) as {
    data?: TopicListItem[];
  };
  return res.data ?? [];
}

export type CreateTopicPayload = {
  name: string;
  subject: string;
};

export async function createTopic(
  payload: CreateTopicPayload
): Promise<TopicListItem> {
  const res = (await api.post("/topics", payload)) as { data: TopicListItem };
  return res.data;
}
