import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
  topicListQuerySchema,
  createTopicBodySchema,
} from "@/lib/schemas/topic.schema";
import * as topicService from "@/services/topic.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "STUDENT", "FACULTY", "ADMIN");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const { subject } = topicListQuerySchema.parse(query);

  const topics = await topicService.listTopicsBySubject(subject);
  return ApiResponse.success(topics);
});

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "STUDENT", "FACULTY", "ADMIN");

  const body = await withValidation(req, createTopicBodySchema);
  const topic = await topicService.createTopic(body);
  return ApiResponse.created(topic, "Topic added");
});
