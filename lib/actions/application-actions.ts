"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCandidate } from "@/lib/auth/session";
import { candidateStore, ApplicationRecord } from "@/lib/db/candidate-store";
import { ActionResult } from "@/types";

// ==============================================================================
// 1. SCHEMAS
// ==============================================================================

const applicationSubmissionSchema = z.object({
  jobId: z.string().min(1, "Job identifier is required."),
  resumeId: z.string().min(1, "Please select a resume from your Resume Vault."),
  coverNote: z
    .string()
    .max(1000, "Cover note cannot exceed 1,000 characters.")
    .optional(),
  consentAgreed: z.literal(true, {
    errorMap: () => ({
      message: "You must consent to sharing your application data with the employer.",
    }),
  }),
});

// ==============================================================================
// 2. SUBMIT APPLICATION ACTION
// ==============================================================================

export async function submitApplicationAction(
  data: z.infer<typeof applicationSubmissionSchema>
): Promise<ActionResult<{ applicationId: string; redirectUrl: string }>> {
  try {
    const user = await requireCandidate();

    const validated = applicationSubmissionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid application data.",
      };
    }

    const application = await candidateStore.submitApplication({
      userId: user.id,
      jobId: validated.data.jobId,
      resumeId: validated.data.resumeId,
      coverNote: validated.data.coverNote,
    });

    revalidatePath("/c/applications");
    revalidatePath("/c/dashboard");
    revalidatePath(`/jobs/${application.jobSlug}`);

    return {
      success: true,
      data: {
        applicationId: application.id,
        redirectUrl: "/c/applications",
      },
      message: "Your application was submitted successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit application.";
    return {
      success: false,
      error: message,
    };
  }
}

// ==============================================================================
// 3. QUERY ACTIONS (IDOR-Hardened)
// ==============================================================================

export async function getCandidateApplicationsAction(): Promise<ActionResult<ApplicationRecord[]>> {
  try {
    const user = await requireCandidate();
    const list = await candidateStore.getApplications(user.id);
    return { success: true, data: list };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch applications.";
    return { success: false, error: message };
  }
}

export async function getApplicationDetailAction(
  applicationId: string
): Promise<ActionResult<ApplicationRecord>> {
  try {
    const user = await requireCandidate();
    const app = await candidateStore.getApplicationById(user.id, applicationId);

    if (!app) {
      return { success: false, error: "Application not found or access denied." };
    }

    return { success: true, data: app };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch application details.";
    return { success: false, error: message };
  }
}
