import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
  classIdParamSchema,
  classMutationScopeQuerySchema,
  updateClassBodySchema,
} from "@/lib/schemas/class.schema";
import * as classService from "@/services/class.service";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const { classId } = classIdParamSchema.parse(await params);
  const { searchParams } = new URL(req.url);
  const { scope } = classMutationScopeQuerySchema.parse({
    scope: searchParams.get("scope") ?? undefined,
  });

  const impact = await classService.getDeleteImpactForFaculty(session.user.id, classId, scope);
  return ApiResponse.success(impact);
});

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
  const { searchParams } = new URL(req.url);
  const { scope } = classMutationScopeQuerySchema.parse({
    scope: searchParams.get("scope") ?? undefined,
  });
  const deleted = await classService.deleteForFaculty(session.user.id, classId, scope);

  return ApiResponse.success({ id: classId, ...deleted }, "Class deleted successfully");
});
