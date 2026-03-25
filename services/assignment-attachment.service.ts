import { RoleEnum } from "@prisma/client";
import { ValidationError } from "@/lib/utils/errors";
import { buildCloudFrontUrl, uploadBytesToS3 } from "@/lib/utils/s3-upload";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

function sanitizeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_");
}

function getFileExtension(filename: string) {
  const match = filename.match(/(\.[a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : "";
}

export async function uploadAssignmentAttachmentForRole(params: {
  role: RoleEnum;
  file: Blob;
}) {
  const { role, file } = params;
  const size = file.size ?? 0;
  if (size <= 0) {
    throw new ValidationError("Uploaded file is empty");
  }
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError("File size cannot exceed 15 MB");
  }

  const typedFile = file as File;
  const originalName = typedFile.name?.trim() || "attachment";
  const extension = getFileExtension(originalName);
  const safeName = sanitizeFilename(originalName);
  const rolePrefix = role.toLowerCase();
  const objectKey = `instructis/assignments/${rolePrefix}/${Date.now()}-${crypto.randomUUID()}${extension}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  await uploadBytesToS3({
    objectKey,
    bytes,
    contentType: typedFile.type || "application/octet-stream",
    contentDisposition: `inline; filename="${safeName}"`,
  });

  return {
    objectKey,
    url: buildCloudFrontUrl(objectKey),
  };
}

