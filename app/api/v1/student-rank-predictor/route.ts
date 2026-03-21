import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import * as aiRankService from "@/services/ai-rank.service";

export const GET = catchAsync(async (req: NextRequest) => {
    const session = await withAuth(req);
    withRole(session, "STUDENT");

    const data = await aiRankService.getStudentRankPredictorByUserId(session.user.id);
    return ApiResponse.success(data);
});

export const POST = catchAsync(async (req: NextRequest) => {
    const session = await withAuth(req);
    withRole(session, "STUDENT");

    const data = await aiRankService.refreshStudentRankPredictorByUserId(session.user.id);
    return ApiResponse.success(data, "Prediction refreshed");
});
