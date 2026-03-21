import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import * as practiceService from "@/services/practice.service";
import { practiceQuerySchema } from "@/lib/schemas/practice.schema";

export const GET = catchAsync(async (req: NextRequest) => {
    const session = await withAuth(req);
    withRole(session, "STUDENT");

    const { searchParams } = new URL(req.url);
    const parsed = practiceQuerySchema.parse({
        topicId: searchParams.get("topicId") ?? undefined,
    });

    const data = await practiceService.getPracticeScreenData(session.user.id, parsed.topicId);
    return ApiResponse.success(data);
});
