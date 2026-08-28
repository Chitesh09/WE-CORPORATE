"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCandidate } from "@/lib/auth/session";
import { candidateStore, CandidateProfileData } from "@/lib/db/candidate-store";
import { storageService } from "@/lib/storage";
import { ActionResult } from "@/types";

// ==============================================================================
// 1. SCHEMAS
// ==============================================================================

const optionalUrl = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return "";
    const trimmed = val.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  })
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid website URL." }
  );

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters.").max(100),
  headline: z.string().max(200, "Headline too long.").optional(),
  phoneNumber: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  experienceLevel: z.string().optional(),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters.").optional(),
  skills: z.array(z.string()).optional().default([]),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

// ==============================================================================
// 2. PROFILE ACTIONS
// ==============================================================================

export async function updateCandidateProfileAction(
  data: Partial<CandidateProfileData> & { fullName?: string }
): Promise<ActionResult> {
  try {
    const user = await requireCandidate();

    const validated = profileSchema.safeParse(data);
    if (!validated.success) {
      const issue = validated.error.issues[0]?.message || "Validation failed. Please check your inputs.";
      return {
        success: false,
        error: issue,
      };
    }

    // Ensure candidate record exists in store instance
    await candidateStore.ensureCandidateFromSession(user);

    await candidateStore.updateProfile(user.id, {
      fullName: validated.data.fullName,
      email: user.email,
      headline: validated.data.headline || "",
      phoneNumber: validated.data.phoneNumber || "",
      city: validated.data.city || "",
      state: validated.data.state || "",
      experienceLevel: validated.data.experienceLevel || "freshers",
      bio: validated.data.bio || "",
      skills: validated.data.skills || [],
      linkedinUrl: validated.data.linkedinUrl || undefined,
      githubUrl: validated.data.githubUrl || undefined,
      portfolioUrl: validated.data.portfolioUrl || undefined,
    });

    revalidatePath("/c/profile");
    revalidatePath("/c/dashboard");

    return {
      success: true,
      data: null,
      message: "Profile updated successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 3. RESUME VAULT ACTIONS
// ==============================================================================

export async function registerUploadedResumeAction(params: {
  fileName: string;
  fileSizeBytes: number;
}): Promise<ActionResult<{ resumeId: string; presignedUploadUrl: string }>> {
  try {
    const user = await requireCandidate();

    // Strict validation
    if (!params.fileName.toLowerCase().endsWith(".pdf")) {
      return { success: false, error: "Only PDF documents (.pdf) are permitted in the Resume Vault." };
    }

    if (params.fileSizeBytes <= 0 || params.fileSizeBytes > 5 * 1024 * 1024) {
      return { success: false, error: "File size exceeds maximum allowed limit (5 MB)." };
    }

    const sanitizedFileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueKey = `candidates/${user.id}/resumes/${Date.now()}_${sanitizedFileName}`;

    // Get presigned upload URL from R2 storage abstraction
    const presignedUploadUrl = await storageService.getPresignedUploadUrl(
      uniqueKey,
      "application/pdf",
      900 // 15 minutes TTL
    );

    // Register record in candidate store
    const resume = await candidateStore.addResume({
      userId: user.id,
      fileName: sanitizedFileName,
      storageKey: uniqueKey,
      fileSizeBytes: params.fileSizeBytes,
      mimeType: "application/pdf",
    });

    revalidatePath("/c/resumes");
    revalidatePath("/c/dashboard");

    return {
      success: true,
      data: {
        resumeId: resume.id,
        presignedUploadUrl,
      },
      message: "Resume registered successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload resume.";
    return { success: false, error: message };
  }
}

export async function setPrimaryResumeAction(resumeId: string): Promise<ActionResult> {
  try {
    const user = await requireCandidate();
    await candidateStore.setPrimaryResume(user.id, resumeId);

    revalidatePath("/c/resumes");
    revalidatePath("/c/dashboard");

    return { success: true, data: null, message: "Primary resume updated." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to set primary resume.";
    return { success: false, error: message };
  }
}

export async function deleteResumeAction(resumeId: string): Promise<ActionResult> {
  try {
    const user = await requireCandidate();
    await candidateStore.deleteResume(user.id, resumeId);

    revalidatePath("/c/resumes");
    revalidatePath("/c/dashboard");

    return { success: true, data: null, message: "Resume removed from vault." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete resume.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 4. SAVED JOBS ACTIONS
// ==============================================================================

export async function toggleSaveJobAction(jobId: string): Promise<ActionResult<{ isSaved: boolean }>> {
  try {
    const user = await requireCandidate();

    const currentlySaved = await candidateStore.isJobSaved(user.id, jobId);

    if (currentlySaved) {
      await candidateStore.unsaveJob(user.id, jobId);
      revalidatePath("/c/saved");
      revalidatePath("/c/dashboard");
      return {
        success: true,
        data: { isSaved: false },
        message: "Opportunity removed from saved list.",
      };
    } else {
      await candidateStore.saveJob(user.id, jobId);
      revalidatePath("/c/saved");
      revalidatePath("/c/dashboard");
      return {
        success: true,
        data: { isSaved: true },
        message: "Opportunity saved to your candidate account.",
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save opportunity.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 5. SECURITY & SETTINGS ACTIONS
// ==============================================================================

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    const user = await requireCandidate();

    const validated = passwordChangeSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Password must be at least 8 characters with 1 uppercase letter and 1 number.",
      };
    }

    await candidateStore.changePassword(
      user.id,
      validated.data.currentPassword,
      validated.data.newPassword
    );

    return {
      success: true,
      data: null,
      message: "Password changed successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update password.";
    return { success: false, error: message };
  }
}

export async function exportCandidateDataAction(): Promise<ActionResult<unknown>> {
  try {
    const user = await requireCandidate();
    const data = await candidateStore.exportData(user.id);
    return {
      success: true,
      data,
      message: "Data export generated successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export candidate data.";
    return { success: false, error: message };
  }
}
