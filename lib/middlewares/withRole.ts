import type { Session } from "@/lib/auth";
import { ForbiddenError } from "@/lib/utils/errors";

export type Role = "STUDENT" | "FACULTY" | "ADMIN";

/**
 * Ensures the session user has one of the allowed roles. Throws ForbiddenError (403) otherwise.
 * Call after withAuth(). Roles are compared case-insensitively with session.user.role.
 */
export function withRole(session: Session, ...allowedRoles: Role[]): void {
  const userRole = session.user.role?.toUpperCase();
  const hasRole =
    userRole &&
    allowedRoles.some((r) => r.toUpperCase() === userRole);
  if (!hasRole) {
    throw new ForbiddenError(
      "You do not have permission to access this resource"
    );
  }
}
