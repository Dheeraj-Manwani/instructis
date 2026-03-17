import prisma from "@/lib/prisma";

export async function createWhatsAppLog(params: {
    studentId: string;
    parentPhone: string;
    message: string;
    status: string;
    metadata?: any;
}) {
    const { studentId, parentPhone, message, status, metadata } = params;

    await prisma.whatsAppLog.create({
        data: {
            studentId,
            parentPhone,
            message,
            status,
            metadata,
        },
    });
}

