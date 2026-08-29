"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { jobStore } from "@/lib/db/job-store";
import { candidateStore, ApplicationRecord } from "@/lib/db/candidate-store";
import { ApplicationStatus, ActionResult } from "@/types";

const stageUpdateSchema = z.object({
  jobId: z.string().min(1, "Job ID is required."),
  applicationId: z.string().min(1, "Application ID is required."),
  newStage: z.enum(["applied", "under_review", "shortlisted", "not_selected", "hired"]),
  note: z.string().max(500).optional(),
});

/**
 * Retrieve all applications for a specific employer opportunity.
 * Strictly verifies company ownership (IDOR-hardened).
 */
export async function getJobApplicantsAction(
  jobId: string
): Promise<ActionResult<{ jobTitle: string; applications: ApplicationRecord[] }>> {
  try {
    const user = await requireEmployer();
    const companyData = await employerStore.getCompanyForEmployer(user.id);
    if (!companyData) {
      return { success: false, error: "Employer organization not found." };
    }

    const job = await jobStore.getJobById(jobId);
    if (!job) {
      return { success: false, error: "Job opportunity not found." };
    }

    // IDOR Protection: Verify the job belongs to this recruiter's company
    if (job.companyId !== companyData.company.id && job.company.slug !== companyData.company.slug) {
      return { success: false, error: "Access denied: You are not authorized to view applicants for this role." };
    }

    const applications = await candidateStore.getApplicationsForJob(companyData.company.id, jobId);

    return {
      success: true,
      data: {
        jobTitle: job.title,
        applications,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch applicants.";
    return { success: false, error: message };
  }
}

/**
 * Recruiter updates an applicant's review stage.
 * Enforces valid state transitions and writes immutable audit logs.
 */
export async function updateApplicationStageAction(
  params: z.infer<typeof stageUpdateSchema>
): Promise<ActionResult<ApplicationRecord>> {
  try {
    const user = await requireEmployer();
    const validated = stageUpdateSchema.safeParse(params);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid status payload.",
      };
    }

    const companyData = await employerStore.getCompanyForEmployer(user.id);
    if (!companyData) {
      return { success: false, error: "Employer organization not found." };
    }

    const job = await jobStore.getJobById(validated.data.jobId);
    if (!job) {
      return { success: false, error: "Job opportunity not found." };
    }

    if (job.companyId !== companyData.company.id && job.company.slug !== companyData.company.slug) {
      return { success: false, error: "Access denied: You do not own this job opportunity." };
    }

    const updated = await candidateStore.updateApplicationStage({
      employerUserId: user.id,
      companyId: companyData.company.id,
      jobId: validated.data.jobId,
      applicationId: validated.data.applicationId,
      newStatus: validated.data.newStage as ApplicationStatus,
      note: validated.data.note,
    });

    revalidatePath(`/e/jobs/${validated.data.jobId}/applicants`);
    revalidatePath("/c/applications");
    revalidatePath("/c/dashboard");

    return {
      success: true,
      data: updated,
      message: `Applicant stage updated to ${validated.data.newStage.replace("_", " ")}.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update applicant stage.";
    return { success: false, error: message };
  }
}

/**
 * Recruiter updates an applicant's star rating (1-5) and internal notes.
 */
export async function updateApplicationEvaluationAction(params: {
  jobId: string;
  applicationId: string;
  rating?: number;
  recruiterNotes?: string;
}): Promise<ActionResult<ApplicationRecord>> {
  try {
    const user = await requireEmployer();
    const companyData = await employerStore.getCompanyForEmployer(user.id);
    if (!companyData) {
      return { success: false, error: "Employer organization not found." };
    }

    const job = await jobStore.getJobById(params.jobId);
    if (!job) {
      return { success: false, error: "Job opportunity not found." };
    }

    if (job.companyId !== companyData.company.id && job.company.slug !== companyData.company.slug) {
      return { success: false, error: "Access denied: You do not own this job opportunity." };
    }

    const updated = await candidateStore.updateApplicationEvaluation({
      employerUserId: user.id,
      companyId: companyData.company.id,
      jobId: params.jobId,
      applicationId: params.applicationId,
      rating: params.rating,
      recruiterNotes: params.recruiterNotes,
    });

    revalidatePath(`/e/jobs/${params.jobId}/applicants`);

    return {
      success: true,
      data: updated,
      message: "Candidate evaluation saved.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update candidate evaluation.";
    return { success: false, error: message };
  }
}
