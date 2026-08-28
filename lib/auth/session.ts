import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionUser, UserRole, UserStatus } from "@/types";

export const SESSION_COOKIE_NAME = "we_corporate_session";
const SESSION_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "we-corporate-secure-development-secret-key-32-bytes"
);

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
  exp?: number;
}

/**
 * Creates a signed JWT session token.
 * Defaults to 7-day expiration.
 */
export async function createSessionToken(user: {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
}): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    companyId: user.companyId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SESSION_SECRET);

  return token;
}

/**
 * Verifies and decodes a signed JWT session token.
 * Returns null if token is invalid or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Sets the HTTP-only, secure session cookie.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export const CANDIDATE_PROFILE_COOKIE_NAME = "we_corporate_cand_prof";
export const EMPLOYER_PROFILE_COOKIE_NAME = "we_corporate_emp_prof";

/**
 * Sets the HTTP-only, secure candidate profile snapshot cookie.
 */
export async function setCandidateProfileCookie(profile: unknown): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CANDIDATE_PROFILE_COOKIE_NAME, JSON.stringify(profile), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/**
 * Retrieves the candidate profile snapshot from the cookie.
 */
export async function getCandidateProfileCookie<T = Record<string, unknown>>(): Promise<T | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CANDIDATE_PROFILE_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Sets the HTTP-only, secure employer company snapshot cookie.
 */
export async function setEmployerCompanyCookie(company: unknown): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(EMPLOYER_PROFILE_COOKIE_NAME, JSON.stringify(company), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

/**
 * Retrieves the employer company snapshot from the cookie.
 */
export async function getEmployerCompanyCookie<T = Record<string, unknown>>(): Promise<T | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(EMPLOYER_PROFILE_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Clears the session cookie on logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CANDIDATE_PROFILE_COOKIE_NAME);
  cookieStore.delete(EMPLOYER_PROFILE_COOKIE_NAME);
}

/**
 * Retrieves the currently authenticated user from the session cookie.
 * Performs server-side validation on token signature and account status.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const payload = await verifySessionToken(sessionCookie.value);
  if (!payload) {
    return null;
  }

  // Suspended or disabled accounts are immediately invalidated
  if (payload.status === "suspended") {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    status: payload.status,
    companyId: payload.companyId,
  };
}

/**
 * Asserts that the active request is authenticated as a candidate.
 * Returns the SessionUser or throws an UNAUTHORIZED / FORBIDDEN error.
 */
export async function requireCandidate(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: Please sign in to access your candidate account.");
  }

  if (user.role !== "candidate") {
    throw new Error("FORBIDDEN: Requires candidate privileges.");
  }

  if (user.status === "suspended") {
    throw new Error("FORBIDDEN: Account suspended. Contact support@wecorporate.in.");
  }

  return user;
}

/**
 * Asserts that the active request is authenticated as an employer.
 * Returns the SessionUser or throws an UNAUTHORIZED / FORBIDDEN error.
 */
export async function requireEmployer(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: Please sign in to access your employer workspace.");
  }

  if (user.role !== "employer") {
    throw new Error("FORBIDDEN: Requires employer / recruiter privileges.");
  }

  if (user.status === "suspended") {
    throw new Error("FORBIDDEN: Employer account suspended. Contact support@wecorporate.in.");
  }

  return user;
}

/**
 * Asserts that the active request is authenticated as an administrator.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED: Please sign in to access the administrator console.");
  }

  if (user.role !== "admin") {
    throw new Error("FORBIDDEN: Requires administrator privileges.");
  }

  return user;
}
