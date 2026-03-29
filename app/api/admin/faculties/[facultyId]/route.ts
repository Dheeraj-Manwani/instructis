import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import {
  facultyIdParamSchema,
  updateFacultyBodySchema,
} from "@/lib/schemas/faculty.schema";
import * as facultyService from "@/services/admin-faculty.service";

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { facultyId } = facultyIdParamSchema.parse(await params);
  const body = await withValidation(req, updateFacultyBodySchema);
  const updated = await facultyService.updateFaculty(facultyId, body);

  return ApiResponse.success(updated, "Faculty updated successfully");
});

export const DELETE = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { facultyId } = facultyIdParamSchema.parse(await params);
  const result = await facultyService.removeFacultyRole(facultyId);

  return ApiResponse.success(result, "Faculty role removed");
});
