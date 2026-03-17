import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { batchIdParamSchema } from "@/lib/schemas/batch.schema";
import * as batchService from "@/services/batch.service";
import type { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest, { params }) => {
    const session = await withAuth(req);
    withRole(session, "ADMIN");

    const { id } = batchIdParamSchema.parse(await params);
    const faculties = await batchService.getFacultiesInBatch(id);
    return ApiResponse.success(faculties);
});

