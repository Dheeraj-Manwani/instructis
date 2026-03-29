import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { classIdParamSchema, updateClassBodySchema } from "@/lib/schemas/class.schema";
import * as classService from "@/services/class.service";

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const { classId } = classIdParamSchema.parse(await params);
  const body = await withValidation(req, updateClassBodySchema);
  const updated = await classService.updateForFaculty(session.user.id, classId, body);

  return ApiResponse.success(updated, "Class updated successfully");
});

export const DELETE = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const { classId } = classIdParamSchema.parse(await params);
  await classService.deleteForFaculty(session.user.id, classId);

  return ApiResponse.success({ id: classId }, "Class deleted successfully");
});
