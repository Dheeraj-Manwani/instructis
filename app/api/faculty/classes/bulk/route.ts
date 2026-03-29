import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { createRecurringClassBodySchema } from "@/lib/schemas/class.schema";
import * as classService from "@/services/class.service";

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY");

  const body = await withValidation(req, createRecurringClassBodySchema);
  const created = await classService.createRecurringForFaculty(session.user.id, body);

  return ApiResponse.created(created, "Recurring classes scheduled successfully");
});
