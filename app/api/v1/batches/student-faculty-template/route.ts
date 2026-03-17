import { NextRequest } from "next/server";

import { catchAsync } from "@/lib/utils/catchAsync";
import { ApiResponse } from "@/lib/utils/api-response";

export const GET = catchAsync(async (_req: NextRequest) => {
  const url = process.env.STUDENT_FACULTY_TEMPLATE_URL;

  if (!url) {
    return ApiResponse.error("Template URL is not configured", 500);
  }

  return ApiResponse.success({ url }, "Template URL fetched successfully");
});

