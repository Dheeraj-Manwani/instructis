import { auth } from "@/lib/auth";
import type { Session } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/utils/errors";
import { NextRequest } from "next/server";

/**
 * Gets the current session from the request. Throws UnauthorizedError (401) if not authenticated.
 * Use in every protected route before withRole or business logic.
 */
export async function withAuth(req: NextRequest): Promise<Session> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    throw new UnauthorizedError("You must be signed in to access this resource");
  }
  return session;
}
