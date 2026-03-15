import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
    batchIdParamSchema,
    addFacultiesToBatchSchema,
} from "@/lib/schemas/batch.schema";
import * as batchService from "@/services/batch.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "ADMIN");

    const { id } = batchIdParamSchema.parse(await params);
    const faculties = await batchService.getFacultiesNotInBatch(id);
    return ApiResponse.success(faculties);
});

export const POST = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "ADMIN");

    const { id } = batchIdParamSchema.parse(await params);
    const body = await withValidation(req, addFacultiesToBatchSchema);
    await batchService.addFacultiesToBatch(id, body.facultyIds);
    return ApiResponse.success(null, "Faculties added to batch");
});
