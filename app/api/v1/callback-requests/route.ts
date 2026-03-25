import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { withRateLimit } from "@/lib/middlewares/withRateLimit";
import { ApiResponse } from "@/lib/utils/api-response";
import {
  callbackRequestListQuerySchema,
  createCallbackRequestBodySchema,
} from "@/lib/schemas/callback-request.schema";
import * as callbackRequestService from "@/services/callback-request.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const { page, limit, status } = callbackRequestListQuerySchema.parse(
    query
  );

  const result = await callbackRequestService.listCallbackRequests({
    page,
    limit,
    status,
  });
  return ApiResponse.success(result.data, undefined, result.meta);
});

export const POST = catchAsync(async (req: NextRequest) => {
  // Prevent spam on the public landing page form.
  withRateLimit(req, { max: 20 });

  const body = await withValidation(
    req,
    createCallbackRequestBodySchema
  );
  const created = await callbackRequestService.createCallbackRequest(body);
  return ApiResponse.created(created, "Callback request submitted");
});

