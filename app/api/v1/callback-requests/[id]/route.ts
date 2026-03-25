import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
  callbackRequestIdParamSchema,
  updateCallbackRequestStatusBodySchema,
} from "@/lib/schemas/callback-request.schema";
import * as callbackRequestService from "@/services/callback-request.service";
import { NextRequest } from "next/server";

export const PATCH = catchAsync(
  async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "ADMIN");

    const { id } = callbackRequestIdParamSchema.parse(await params);
    const body = await withValidation(
      req,
      updateCallbackRequestStatusBodySchema
    );

    const updated =
      await callbackRequestService.updateCallbackRequestStatus(id, body);
    return ApiResponse.success(updated, "Callback request updated");
  }
);

