import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
  batchListQuerySchema,
  createBatchBodySchema,
} from "@/lib/schemas/batch.schema";
import * as batchService from "@/services/batch.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const parsed = batchListQuerySchema.parse(query);

  const result = await batchService.listBatches(parsed);
  return ApiResponse.success(result.data, undefined, result.meta);
});

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "ADMIN");

  const body = await withValidation(req, createBatchBodySchema);
  const batch = await batchService.createBatch(body);
  return ApiResponse.created(batch, "Batch created");
});
