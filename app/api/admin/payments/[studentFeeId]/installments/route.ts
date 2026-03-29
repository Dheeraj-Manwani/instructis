import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import {
  createInstallmentBodySchema,
  studentFeeIdParamSchema,
} from "@/lib/schemas/payment.schema";
import * as paymentService from "@/services/payment.service";

export const POST = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { studentFeeId } = studentFeeIdParamSchema.parse(await params);
  const body = await withValidation(req, createInstallmentBodySchema);

  const created = await paymentService.addInstallment(
    studentFeeId,
    body,
    session.user.id
  );

  return ApiResponse.created(created, "Installment added");
});
