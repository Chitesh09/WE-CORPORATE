import { SessionUser, UserRole } from "@/types";

/**
 * Validates whether the active session user matches the required role.
 * Throws an explicit error if unauthorized or forbidden.
 */
export function assertRole(user: SessionUser | null | undefined, requiredRole: UserRole): asserts user is SessionUser {
  if (!user) {
    throw new Error("UNAUTHORIZED: You must be logged in to perform this action.");
  }
  if (user.role !== requiredRole && user.role !== "admin") {
    throw new Error(`FORBIDDEN: Requires ${requiredRole} privileges.`);
  }
}

/**
 * Asserts that the authenticated user owns the resource being mutated.
 */
export function assertOwnership(user: SessionUser | null | undefined, resourceOwnerId: string): asserts user is SessionUser {
  if (!user) {
    throw new Error("UNAUTHORIZED: Session expired or invalid.");
  }
  if (user.id !== resourceOwnerId && user.role !== "admin") {
    throw new Error("FORBIDDEN: You do not have permission to modify this resource.");
  }
}

/**
 * Placeholder session resolver for Phase 6 foundation.
 * Full Auth.js v5 credentials and OAuth providers will be wired in later phases.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // Foundational mock session resolver for route shell rendering
  return null;
}
