import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import { paymentListQuerySchema } from "@/lib/schemas/payment.schema";
import * as paymentService from "@/services/payment.service";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const { page, limit, batchId, status, search } = paymentListQuerySchema.parse(query);

  const result = await paymentService.listPayments({
    page,
    limit,
    batchId,
    status,
    search,
  });

  return ApiResponse.success(
    {
      data: result.data,
      batches: result.batches,
      summary: result.summary,
    },
    undefined,
    result.meta
  );
});
