import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import * as practiceService from "@/services/practice.service";
import { startPracticeSessionBodySchema } from "@/lib/schemas/practice.schema";

export const POST = catchAsync(async (req: NextRequest) => {
    const session = await withAuth(req);
    withRole(session, "STUDENT");

    const body = await withValidation(req, startPracticeSessionBodySchema);
    const data = await practiceService.startPracticeSession(session.user.id, body.topicId);
    return ApiResponse.created(data, "Practice session started");
});
