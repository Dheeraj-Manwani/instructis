import { NextRequest } from "next/server";
import { ZodSchema } from "zod";
import { ValidationError } from "@/lib/utils/errors";

/**
 * Parses and validates the request body with the given Zod schema.
 * Throws ValidationError (400) if validation fails. Never access req.json() directly in route handlers.
 */
export async function withValidation<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON body");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const message =
      result.error.issues[0]?.message ?? "Validation failed";
    throw new ValidationError(message, result.error.flatten());
  }
  return result.data;
}
