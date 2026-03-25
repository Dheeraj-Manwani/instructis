import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function createWhatsAppLog(params: {
    studentId: string;
    parentPhone: string;
    message: string;
    status: string;
    // Prisma `Json?` fields accept `InputJsonValue` (and also the special "JsonNull" wrapper for explicit nulls).
    metadata?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
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

