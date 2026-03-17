import { NextRequest } from "next/server";

import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { aiRankAnalyzeSchema } from "@/lib/validations/ai-rank.schema";
import * as aiRankService from "@/services/ai-rank.service";

export const POST = catchAsync(async (req: NextRequest) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const body = await withValidation(req, aiRankAnalyzeSchema);

    const result = await aiRankService.analyzeStudentPerformance({
        batchId: body.batchId,
        studentId: body.studentId,
    });

    return ApiResponse.success(result);
});

