"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore, CompanyRecord } from "@/lib/db/employer-store";
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

const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters.").max(150),
  websiteUrl: optionalUrl,
  industry: z.string().min(2, "Industry is required.").max(100),
  companySize: z.string().min(2, "Company size is required."),
  headquartersCity: z.string().min(2, "Headquarters city is required."),
  headquartersState: z.string().optional(),
  about: z.string().min(10, "About description must be at least 10 characters.").max(2000),
  publicContactEmail: z.string().email("Invalid email format.").or(z.literal("")).optional(),
});

const verificationSubmissionSchema = z.object({
  businessRegistrationType: z.enum([
    "CIN",
    "GSTIN",
    "LLPIN",
    "Udyam",
    "IncorporationCertificate",
    "Other",
  ]),
  registrationNumber: z
    .string()
    .min(3, "Registration number must be at least 3 characters.")
    .max(50),
  officialWebsite: z.string().url("Valid official website URL required."),
  authorizationNote: z
    .string()
    .max(1000, "Authorization note cannot exceed 1000 characters.")
    .optional(),
  documentFileName: z.string().optional(),
});

const employerPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

// ==============================================================================
// 2. COMPANY PROFILE ACTIONS
// ==============================================================================

export async function updateCompanyProfileAction(
  data: z.input<typeof companyProfileSchema>
): Promise<ActionResult<CompanyRecord>> {
  try {
    const user = await requireEmployer();
    await employerStore.ensureEmployerFromSession(user);

    const validated = companyProfileSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed.",
      };
    }

    const updated = await employerStore.updateCompanyProfile(user.id, {
      name: validated.data.name,
      websiteUrl: validated.data.websiteUrl || undefined,
      industry: validated.data.industry,
      companySize: validated.data.companySize,
      headquartersCity: validated.data.headquartersCity,
      headquartersState: validated.data.headquartersState,
      about: validated.data.about,
      publicContactEmail: validated.data.publicContactEmail || undefined,
    });

    revalidatePath("/e/company");
    revalidatePath("/e/dashboard");

    return {
      success: true,
      data: updated,
      message: "Company profile updated successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update company profile.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 3. VERIFICATION SUBMISSION ACTIONS
// ==============================================================================

export async function submitVerificationEvidenceAction(
  data: z.infer<typeof verificationSubmissionSchema>
): Promise<ActionResult> {
  try {
    const user = await requireEmployer();

    const validated = verificationSubmissionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed.",
      };
    }

    await employerStore.submitVerificationEvidence({
      userId: user.id,
      businessRegistrationType: validated.data.businessRegistrationType,
      registrationNumber: validated.data.registrationNumber,
      officialWebsite: validated.data.officialWebsite,
      authorizationNote: validated.data.authorizationNote,
      documentFileName: validated.data.documentFileName,
    });

    revalidatePath("/e/verification");
    revalidatePath("/e/dashboard");

    return {
      success: true,
      data: null,
      message: "Verification evidence submitted. Your company status is now Under Review.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit verification.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 4. EMPLOYER SETTINGS ACTIONS
// ==============================================================================

export async function changeEmployerPasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    const user = await requireEmployer();

    const validated = employerPasswordChangeSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: "Password must be at least 8 characters with 1 uppercase letter and 1 number.",
      };
    }

    await employerStore.changePassword(
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
