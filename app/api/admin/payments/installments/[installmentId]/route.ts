import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import {
  installmentIdParamSchema,
  updateInstallmentBodySchema,
} from "@/lib/schemas/payment.schema";
import * as paymentService from "@/services/payment.service";

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { installmentId } = installmentIdParamSchema.parse(await params);
  const body = await withValidation(req, updateInstallmentBodySchema);
  const updated = await paymentService.updateInstallment(
    installmentId,
    body,
    session.user.id
  );

  return ApiResponse.success(updated, "Installment updated");
});

export const DELETE = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { installmentId } = installmentIdParamSchema.parse(await params);
  const deleted = await paymentService.deleteInstallment(installmentId);

  return ApiResponse.success(deleted, "Installment deleted");
});
