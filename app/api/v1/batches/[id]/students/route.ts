import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import {
    batchIdParamSchema,
    addStudentsToBatchSchema,
} from "@/lib/schemas/batch.schema";
import * as batchService from "@/services/batch.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "ADMIN");

    const { id } = batchIdParamSchema.parse(await params);
    const students = await batchService.getStudentsNotInBatch(id);
    return ApiResponse.success(students);
});

export const POST = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "ADMIN");

    const { id } = batchIdParamSchema.parse(await params);
    const body = await withValidation(req, addStudentsToBatchSchema);
    await batchService.addStudentsToBatch(id, body.studentIds);
    return ApiResponse.success(null, "Students added to batch");
});
