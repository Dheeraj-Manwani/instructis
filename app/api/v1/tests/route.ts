import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { withValidation } from "@/lib/middlewares/withValidation";
import { ApiResponse } from "@/lib/utils/api-response";
import { createMockTestBodySchema } from "@/lib/schemas/mock-test.schema";
import * as mockTestService from "@/services/mock-test.service";
import * as userRepository from "@/repositories/user.repository";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const POST = catchAsync(async (req: NextRequest) => {
    const session = await withAuth(req);
    withRole(session, "FACULTY", "ADMIN");

    const body = await withValidation(req, createMockTestBodySchema);

    // Get faculty ID from user
    const user = await userRepository.getUserByIdOrThrow(session.user.id);
    const faculty = await prisma.faculty.findUnique({
        where: { userId: user.id },
        select: { id: true },
    });

    if (!faculty) {
        throw new Error("Faculty record not found");
    }

    const test = await mockTestService.createMockTest({
        ...body,
        facultyId: faculty.id,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    });

    return ApiResponse.created(test, "Test created");
});
