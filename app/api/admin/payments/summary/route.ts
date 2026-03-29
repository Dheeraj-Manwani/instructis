import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import * as paymentService from "@/services/payment.service";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const summary = await paymentService.getPaymentSummary();
  return ApiResponse.success(summary);
});
