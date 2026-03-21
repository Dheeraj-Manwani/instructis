import { z } from "zod";
import prisma from "@/lib/prisma";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ForbiddenError, NotFoundError } from "@/lib/utils/errors";
import { generateTestAttemptReportPdf } from "@/services/test-attempt-report.service";

export const runtime = "nodejs";

export const GET = catchAsync(async (req, { params }) => {
    const session = await withAuth(req);
    withRole(session, "STUDENT", "FACULTY", "ADMIN");

    const attemptId = z.string().min(1).parse((await params)?.attemptId);

    const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
            student: {
                select: {
                    user: {
                        select: { id: true },
                    },
                },
            },
            mockTest: {
                select: {
                    facultyId: true,
                },
            },
        },
    });

    if (!attempt) {
        throw new NotFoundError("Test attempt not found");
    }

    if (session.user.role === "STUDENT") {
        if (attempt.student.user.id !== session.user.id) {
            throw new ForbiddenError("You do not have permission to download this report");
        }
    } else if (session.user.role !== "ADMIN") {
        const faculty = await prisma.faculty.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });
        if (!faculty || faculty.id !== attempt.mockTest.facultyId) {
            throw new ForbiddenError("You do not have permission to download this report");
        }
    }

    const { pdfBytes, filename } = await generateTestAttemptReportPdf(attemptId);
    const responseBody = new Uint8Array(pdfBytes);
    return new Response(responseBody, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    });
});
