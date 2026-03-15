import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import * as batchService from "@/services/batch.service";
import { NextRequest } from "next/server";

export const GET = catchAsync(async (req: NextRequest) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY");

    const batches = await batchService.getBatchesForFaculty(session.user.id);
    return ApiResponse.success(batches);
});
