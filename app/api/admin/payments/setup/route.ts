import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import { setupStudentFeeBodySchema } from "@/lib/schemas/payment.schema";
import * as paymentService from "@/services/payment.service";

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const body = await withValidation(req, setupStudentFeeBodySchema);
  const created = await paymentService.setupStudentFee(body);

  return ApiResponse.created(created, "Fee structure created");
});
