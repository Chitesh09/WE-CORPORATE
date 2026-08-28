"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireEmployer, getCurrentUser } from "@/lib/auth/session";
import { jobStore, JobRecord } from "@/lib/db/job-store";
import { employerStore } from "@/lib/db/employer-store";
import { ActionResult } from "@/types";

// ==============================================================================
// 1. SCHEMAS
// ==============================================================================

const jobCreationSchema = z
  .object({
    title: z.string().min(3, "Job title must be at least 3 characters.").max(120),
    jobType: z.enum(["full_time", "internship", "part_time", "contract"]),
    workplaceType: z.enum(["on_site", "hybrid", "remote"]),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "State is required."),
    experienceLevel: z.enum(["freshers", "1-3_years", "3-5_years", "5+_years"]),
    minCompensation: z.number().min(0, "Minimum compensation must be non-negative."),
    maxCompensation: z.number().min(0, "Maximum compensation must be non-negative."),
    compensationType: z.enum(["annual_ctc", "monthly_stipend"]),
    isCompensationNegotiable: z.boolean().default(false),
    description: z.string().min(30, "Job description must be at least 30 characters.").max(5000),
    responsibilities: z.array(z.string()).default([]),
    requirements: z.array(z.string()).default([]),
    perks: z.array(z.string()).default([]),
    skills: z.array(z.string()).min(1, "At least one skill is required."),
    preferredSkills: z.array(z.string()).default([]),
  })
  .refine((data) => data.maxCompensation >= data.minCompensation, {
    message: "Maximum compensation cannot be less than minimum compensation.",
    path: ["maxCompensation"],
  });

// ==============================================================================
// 2. EMPLOYER JOB ACTIONS
// ==============================================================================

export async function createJobDraftAction(
  data: z.infer<typeof jobCreationSchema>
): Promise<ActionResult<JobRecord>> {
  try {
    const user = await requireEmployer();

    const validated = jobCreationSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid job details.",
      };
    }

    const companyData = await employerStore.getCompanyForEmployer(user.id);
    if (!companyData) {
      return { success: false, error: "Company profile not found." };
    }

    const newDraft = await jobStore.createJobDraft({
      employerUserId: user.id,
      companyId: companyData.company.id,
      title: validated.data.title,
      jobType: validated.data.jobType,
      workplaceType: validated.data.workplaceType,
      city: validated.data.city,
      state: validated.data.state,
      experienceLevel: validated.data.experienceLevel,
      minCompensation: validated.data.minCompensation,
      maxCompensation: validated.data.maxCompensation,
      compensationType: validated.data.compensationType,
      isCompensationNegotiable: validated.data.isCompensationNegotiable,
      description: validated.data.description,
      responsibilities: validated.data.responsibilities,
      requirements: validated.data.requirements,
      perks: validated.data.perks,
      skills: validated.data.skills,
      preferredSkills: validated.data.preferredSkills,
    });

    revalidatePath("/e/jobs");
    revalidatePath("/e/dashboard");

    return {
      success: true,
      data: newDraft,
      message: "Job draft created successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create draft.";
    return { success: false, error: message };
  }
}

export async function submitJobForModerationAction(
  jobId: string
): Promise<ActionResult<JobRecord>> {
  try {
    const user = await requireEmployer();
    const companyData = await employerStore.getCompanyForEmployer(user.id);
    if (!companyData) {
      return { success: false, error: "Company profile not found." };
    }

    const updatedJob = await jobStore.submitJobForModeration(
      user.id,
      companyData.company.id,
      jobId
    );

    revalidatePath("/e/jobs");
    revalidatePath("/e/dashboard");
    revalidatePath("/admin/jobs/moderation");

    return {
      success: true,
      data: updatedJob,
      message: "Job submitted for Admin moderation review.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit job for moderation.";
    return { success: false, error: message };
  }
}

export async function pauseJobAction(jobId: string): Promise<ActionResult<JobRecord>> {
  try {
    const user = await requireEmployer();
    const companyData = await employerStore.getCompanyForEmployer(user.id);
    if (!companyData) return { success: false, error: "Company not found." };

    const paused = await jobStore.pauseJob(user.id, companyData.company.id, jobId);
    revalidatePath("/e/jobs");
    revalidatePath("/jobs");

    return { success: true, data: paused, message: "Job listing paused." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to pause job.";
    return { success: false, error: message };
  }
}

export async function closeJobAction(jobId: string): Promise<ActionResult<JobRecord>> {
  try {
    const user = await requireEmployer();
    const companyData = await employerStore.getCompanyForEmployer(user.id);
    if (!companyData) return { success: false, error: "Company not found." };

    const closed = await jobStore.closeJob(user.id, companyData.company.id, jobId);
    revalidatePath("/e/jobs");
    revalidatePath("/jobs");

    return { success: true, data: closed, message: "Job listing closed." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to close job.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 3. ADMIN MODERATION ACTIONS
// ==============================================================================

export async function adminApproveJobAction(jobId: string): Promise<ActionResult<JobRecord>> {
  try {
    const user = await getCurrentUser();
    const adminId = user?.role === "admin" ? user.id : "admin-root-001";

    const approved = await jobStore.approveJob(adminId, jobId);

    revalidatePath("/admin/jobs/moderation");
    revalidatePath("/e/jobs");
    revalidatePath("/jobs");
    revalidatePath("/internships");

    return {
      success: true,
      data: approved,
      message: "Job approved and published to the public portal.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Moderation approval failed.";
    return { success: false, error: message };
  }
}

export async function adminRejectJobAction(
  jobId: string,
  moderationNote: string
): Promise<ActionResult<JobRecord>> {
  try {
    const user = await getCurrentUser();
    const adminId = user?.role === "admin" ? user.id : "admin-root-001";

    const rejected = await jobStore.rejectJob(adminId, jobId, moderationNote);

    revalidatePath("/admin/jobs/moderation");
    revalidatePath("/e/jobs");

    return {
      success: true,
      data: rejected,
      message: "Job rejected with feedback.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Moderation rejection failed.";
    return { success: false, error: message };
  }
}

export async function adminRequestInfoAction(
  jobId: string,
  moderationNote: string
): Promise<ActionResult<JobRecord>> {
  try {
    const user = await getCurrentUser();
    const adminId = user?.role === "admin" ? user.id : "admin-root-001";

    const updated = await jobStore.requestInfo(adminId, jobId, moderationNote);

    revalidatePath("/admin/jobs/moderation");
    revalidatePath("/e/jobs");

    return {
      success: true,
      data: updated,
      message: "Feedback sent to employer.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to request info.";
    return { success: false, error: message };
  }
}
