import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";
import {
  createFacultyBodySchema,
  facultyListQuerySchema,
} from "@/lib/schemas/faculty.schema";
import * as facultyService from "@/services/admin-faculty.service";

export const GET = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const { page, limit, search, department } = facultyListQuerySchema.parse(query);

  const result = await facultyService.listFaculties({
    page,
    limit,
    search,
    department,
  });

  return ApiResponse.success(
    {
      data: result.data,
      departments: result.departments,
    },
    undefined,
    result.meta
  );
});

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "ADMIN");

  const body = await withValidation(req, createFacultyBodySchema);
  const created = await facultyService.createFaculty(body);

  return ApiResponse.created(created, "Faculty created successfully");
});
