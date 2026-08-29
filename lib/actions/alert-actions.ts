"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCandidate } from "@/lib/auth/session";
import { candidateStore, CandidateJobAlertRecord } from "@/lib/db/candidate-store";
import { ActionResult } from "@/types";

const jobAlertSchema = z.object({
  title: z.string().min(2, "Alert title must be at least 2 characters.").max(100),
  keywords: z.string().min(2, "Keywords / Skills must be at least 2 characters.").max(200),
  location: z.string().max(100).optional(),
  minCompensationLpa: z.number().min(0).max(200).optional(),
  frequency: z.enum(["instant", "daily", "weekly"]).default("daily"),
});

export async function createJobAlertAction(
  data: z.infer<typeof jobAlertSchema>
): Promise<ActionResult<CandidateJobAlertRecord>> {
  try {
    const user = await requireCandidate();

    const validated = jobAlertSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed.",
      };
    }

    const alert = await candidateStore.createJobAlert({
      userId: user.id,
      title: validated.data.title,
      keywords: validated.data.keywords,
      location: validated.data.location,
      minCompensationLpa: validated.data.minCompensationLpa,
      frequency: validated.data.frequency,
    });

    revalidatePath("/c/alerts");
    revalidatePath("/c/dashboard");

    return {
      success: true,
      data: alert,
      message: `Job Alert "${alert.title}" created successfully!`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create job alert.";
    return { success: false, error: message };
  }
}

export async function toggleJobAlertAction(
  alertId: string
): Promise<ActionResult<CandidateJobAlertRecord>> {
  try {
    const user = await requireCandidate();
    const updated = await candidateStore.toggleJobAlert(user.id, alertId);

    revalidatePath("/c/alerts");
    revalidatePath("/c/dashboard");

    return {
      success: true,
      data: updated,
      message: `Job alert ${updated.isActive ? "resumed" : "paused"} successfully.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle job alert.";
    return { success: false, error: message };
  }
}

export async function deleteJobAlertAction(
  alertId: string
): Promise<ActionResult> {
  try {
    const user = await requireCandidate();
    await candidateStore.deleteJobAlert(user.id, alertId);

    revalidatePath("/c/alerts");
    revalidatePath("/c/dashboard");

    return {
      success: true,
      data: null,
      message: "Job alert deleted successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete job alert.";
    return { success: false, error: message };
  }
}
