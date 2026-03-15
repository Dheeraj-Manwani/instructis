import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
  batchIdParamSchema,
  updateBatchBodySchema,
  addStudentsToBatchSchema,
  addFacultiesToBatchSchema,
} from "@/lib/schemas/batch.schema";
import * as batchService from "@/services/batch.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const { id } = batchIdParamSchema.parse(await params);
  const batch = await batchService.getBatchById(id);
  return ApiResponse.success(batch);
});

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const { id } = batchIdParamSchema.parse(await params);
  const body = await withValidation(req, updateBatchBodySchema);
  const batch = await batchService.updateBatch(id, body);
  return ApiResponse.success(batch, "Batch updated");
});
