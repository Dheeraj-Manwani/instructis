import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import {
  studentFeeIdParamSchema,
  updateStudentFeeBodySchema,
} from "@/lib/schemas/payment.schema";
import * as paymentService from "@/services/payment.service";

export const PATCH = catchAsync(async (req: NextRequest, { params }) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { studentFeeId } = studentFeeIdParamSchema.parse(await params);
  const body = await withValidation(req, updateStudentFeeBodySchema);
  const updated = await paymentService.updateStudentFee(studentFeeId, body);

  return ApiResponse.success(updated, "Fee summary updated");
});
