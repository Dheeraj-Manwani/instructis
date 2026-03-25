import { NextRequest } from "next/server";
import { catchAsync } from "@/lib/utils/catchAsync";
import { withAuth } from "@/lib/middlewares/withAuth";
import { withRole } from "@/lib/middlewares/withRole";
import { ApiResponse } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import { uploadAssignmentAttachmentForRole } from "@/services/assignment-attachment.service";
import { RoleEnum } from "@prisma/client";

export const POST = catchAsync(async (req: NextRequest) => {
  const session = await withAuth(req);
  withRole(session, "FACULTY", "STUDENT");

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    throw new ValidationError("No file uploaded");
  }
  const role =
    session.user.role === "FACULTY"
      ? RoleEnum.FACULTY
      : session.user.role === "STUDENT"
        ? RoleEnum.STUDENT
        : null;
  if (!role) {
    throw new ValidationError("Unsupported role");
  }

  const uploaded = await uploadAssignmentAttachmentForRole({
    role,
    file,
  });
  return ApiResponse.created(
    {
      objectKey: uploaded.objectKey,
      url: uploaded.url,
    },
    "Assignment attachment uploaded"
  );
});

