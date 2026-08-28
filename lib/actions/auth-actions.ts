"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { candidateStore } from "@/lib/db/candidate-store";
import { employerStore } from "@/lib/db/employer-store";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
} from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { ActionResult } from "@/types";

// ==============================================================================
// 1. SCHEMAS
// ==============================================================================

const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  agreeTerms: z.literal("on", {
    errorMap: () => ({ message: "You must accept the terms & privacy policy to continue." }),
  }),
});

const employerSignupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),
  email: z.string().email("Please enter a valid work email address."),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters.")
    .max(150, "Company name cannot exceed 150 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  agreeTerms: z.literal("on", {
    errorMap: () => ({ message: "You must accept the terms & employer covenant to continue." }),
  }),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

// ==============================================================================
// 2. CANDIDATE SIGNUP ACTION
// ==============================================================================

export async function candidateSignupAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    agreeTerms: formData.get("agreeTerms"),
  };

  const validated = signupSchema.safeParse(rawData);
  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of validated.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const rateLimit = await checkRateLimit(`signup:${validated.data.email}`, 5, 300);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many registration attempts. Please try again in a few minutes.",
    };
  }

  try {
    const user = await candidateStore.createCandidate({
      email: validated.data.email,
      password: validated.data.password,
      fullName: validated.data.fullName,
    });

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return {
      success: true,
      data: { redirectUrl: "/c/dashboard" },
      message: "Account created successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 3. EMPLOYER SIGNUP ACTION (Server-Enforced role = employer)
// ==============================================================================

export async function employerSignupAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    password: formData.get("password"),
    agreeTerms: formData.get("agreeTerms"),
  };

  const validated = employerSignupSchema.safeParse(rawData);
  if (!validated.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of validated.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(issue.message);
    }
    return {
      success: false,
      error: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const rateLimit = await checkRateLimit(`employer-signup:${validated.data.email}`, 5, 300);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many registration attempts. Please try again in a few minutes.",
    };
  }

  try {
    const { user, company } = await employerStore.createEmployer({
      email: validated.data.email,
      password: validated.data.password,
      fullName: validated.data.fullName,
      companyName: validated.data.companyName,
    });

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: "employer", // Server enforced
      status: user.status,
      companyId: company.id,
    });

    await setSessionCookie(token);

    return {
      success: true,
      data: { redirectUrl: "/e/dashboard" },
      message: "Employer account created successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 4. UNIFIED AUTHENTICATION LOGIN ACTION
// ==============================================================================

export async function candidateLoginAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: "Invalid email address or password format.",
    };
  }

  const rateLimit = await checkRateLimit(`login:${validated.data.email}`, 5, 60);
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many failed login attempts. Please wait 1 minute before trying again.",
    };
  }

  // 1. Check Candidate Account First
  const candidateUser = await candidateStore.findByEmail(validated.data.email);
  if (candidateUser) {
    if (candidateUser.status === "suspended") {
      return {
        success: false,
        error: "This candidate account has been suspended. Contact support@wecorporate.in.",
      };
    }

    const isPassValid = await verifyPassword(validated.data.password, candidateUser.passwordHash);
    if (!isPassValid) {
      return { success: false, error: "Invalid email or password." };
    }

    const token = await createSessionToken(candidateUser);
    await setSessionCookie(token);

    return {
      success: true,
      data: { redirectUrl: "/c/dashboard" },
      message: "Signed in successfully as Candidate.",
    };
  }

  // 2. Check Employer Account
  const employerUser = await employerStore.findByEmail(validated.data.email);
  if (employerUser) {
    if (employerUser.status === "suspended") {
      return {
        success: false,
        error: "This employer account has been suspended. Contact support@wecorporate.in.",
      };
    }

    const isPassValid = await verifyPassword(validated.data.password, employerUser.passwordHash);
    if (!isPassValid) {
      return { success: false, error: "Invalid email or password." };
    }

    const token = await createSessionToken({
      id: employerUser.id,
      email: employerUser.email,
      fullName: employerUser.fullName,
      role: "employer",
      status: employerUser.status,
      companyId: employerUser.companyId,
    });
    await setSessionCookie(token);

    return {
      success: true,
      data: { redirectUrl: "/e/dashboard" },
      message: "Signed in successfully as Employer.",
    };
  }

  // 3. Generic Error for un-matched credentials
  return {
    success: false,
    error: "Invalid email or password.",
  };
}

// ==============================================================================
// 5. LOGOUT ACTION
// ==============================================================================

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}

// ==============================================================================
// 6. SESSION QUERY
// ==============================================================================

export async function getActiveUserAction() {
  return getCurrentUser();
}
