import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
  createClassBodySchema,
  facultyClassListQuerySchema,
} from "@/lib/schemas/class.schema";
import * as classService from "@/services/class.service";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const parsedQuery = facultyClassListQuerySchema.parse(query);
  const data = await classService.listForFaculty(session.user.id, parsedQuery);

  return ApiResponse.success(data);
});

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const body = await withValidation(req, createClassBodySchema);
  const created = await classService.createForFaculty(session.user.id, body);

  return ApiResponse.created(created, "Class scheduled successfully");
});
