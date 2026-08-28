import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JWTPayload {
  userId: string;
  email: string;
  role: "candidate" | "employer" | "admin";
  status: "active" | "suspended" | "pending";
  exp?: number;
}

async function verifyJwtEdge(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const binarySignature = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, data);
    if (!isValid) return null;

    const decodedPayload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload as JWTPayload;
  } catch {
    return null;
  }
}

const SESSION_COOKIE_NAME = "we_corporate_session";
const SESSION_SECRET =
  process.env.NEXTAUTH_SECRET || "we-corporate-secure-development-secret-key-32-bytes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect Candidate Surface (/c/*)
  if (pathname.startsWith("/c")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJwtEdge(sessionCookie.value, SESSION_SECRET);

    if (!payload || payload.role !== "candidate" || payload.status === "suspended") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "CandidateAccessRequired");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Employer Surface (/e/*)
  if (pathname.startsWith("/e")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJwtEdge(sessionCookie.value, SESSION_SECRET);

    if (!payload || payload.role !== "employer" || payload.status === "suspended") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "EmployerAccessRequired");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect Admin Surface (/admin/*)
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJwtEdge(sessionCookie.value, SESSION_SECRET);

    if (!payload || payload.role !== "admin" || payload.status === "suspended") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "AdminAccessRequired");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Protect Services (/jobs, /internships, /career-services, /connect, /companies)
  const isServiceRoute =
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/internships") ||
    pathname.startsWith("/career-services") ||
    pathname.startsWith("/connect") ||
    pathname.startsWith("/companies");

  if (isServiceRoute) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "LoginRequiredToAccessServices");
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJwtEdge(sessionCookie.value, SESSION_SECRET);

    if (!payload || payload.status === "suspended") {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("error", "LoginRequiredToAccessServices");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/c/:path*",
    "/e/:path*",
    "/admin/:path*",
    "/jobs/:path*",
    "/internships/:path*",
    "/career-services/:path*",
    "/connect/:path*",
    "/companies/:path*",
  ],
};
