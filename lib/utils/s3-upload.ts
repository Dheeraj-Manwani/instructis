import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AppError } from "@/lib/utils/errors";

const ASSIGNMENTS_PREFIX = "instructis/assignments/";

function getS3Client() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;

  if (!accessKeyId || !secretAccessKey || !region) {
    throw new AppError("AWS S3 environment variables are not fully configured", 500);
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function encodeObjectKey(key: string) {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildCloudFrontUrl(objectKey: string) {
  const cloudfrontUrl = process.env.CLOUDFRONT_URL;
  if (!cloudfrontUrl) {
    throw new AppError("CLOUDFRONT_URL is not configured", 500);
  }

  const base = cloudfrontUrl.replace(/\/+$/, "");
  const normalizedBase = base.toLowerCase();
  const normalizedKey = objectKey.toLowerCase();

  if (
    normalizedBase.endsWith("instructis/assignments") &&
    normalizedKey.startsWith(ASSIGNMENTS_PREFIX)
  ) {
    const suffix = objectKey.slice(ASSIGNMENTS_PREFIX.length);
    return `${base}/${encodeObjectKey(suffix)}`;
  }

  return `${base}/${encodeObjectKey(objectKey)}`;
}

export async function uploadBytesToS3(params: {
  objectKey: string;
  bytes: Uint8Array;
  contentType?: string;
  contentDisposition?: string;
}) {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new AppError("S3_BUCKET_NAME is not configured", 500);
  }

  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.objectKey,
      Body: params.bytes,
      ContentType: params.contentType ?? "application/octet-stream",
      ContentDisposition: params.contentDisposition,
    })
  );
}

