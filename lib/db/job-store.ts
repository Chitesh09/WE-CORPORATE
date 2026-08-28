import { DEVELOPMENT_JOBS, PublicJob } from "@/lib/db/seed-data";
import { employerStore } from "@/lib/db/employer-store";

export type ExtendedJobStatus =
  | "draft"
  | "pending_moderation"
  | "published"
  | "paused"
  | "closed"
  | "rejected"
  | "needs_info";

export interface JobRecord {
  id: string;
  companyId: string;
  createdById: string;
  title: string;
  slug: string;
  jobType: "full_time" | "internship" | "part_time" | "contract";
  workplaceType: "on_site" | "hybrid" | "remote";
  city: string;
  state: string;
  country: string;
  experienceLevel: "freshers" | "1-3_years" | "3-5_years" | "5+_years";
  minCompensation: number;
  maxCompensation: number;
  compensationType: "annual_ctc" | "monthly_stipend";
  isCompensationNegotiable: boolean;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  skills: string[];
  preferredSkills?: string[];
  acceptsNativeApplications: boolean;
  status: ExtendedJobStatus;
  moderationFeedback?: string;
  moderatedAt?: string;
  moderatedById?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id?: string;
    name: string;
    slug: string;
    logoUrl?: string;
    websiteUrl: string;
    corporateDomain: string;
    companySize: string;
    industry: string;
    headquartersCity: string;
    about: string;
    isVerified: boolean;
  };
}

export interface JobModerationAuditRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  adminId: string;
  action: "APPROVE" | "REJECT" | "REQUEST_INFO";
  prevStatus: ExtendedJobStatus;
  newStatus: ExtendedJobStatus;
  moderationNote?: string;
  timestamp: string;
}

class JobStore {
  private jobs: Map<string, JobRecord> = new Map();
  private moderationAuditLogs: JobModerationAuditRecord[] = [];

  constructor() {
    this.seedInitialJobs();
  }

  private seedInitialJobs() {
    for (const job of DEVELOPMENT_JOBS) {
      this.jobs.set(job.id, {
        ...job,
        companyId: job.company.slug || "company-demo-001",
        createdById: "employer-demo-001",
        country: "India",
        acceptsNativeApplications: true,
        status: job.status as ExtendedJobStatus,
        createdAt: job.publishedAt || new Date().toISOString(),
        updatedAt: job.publishedAt || new Date().toISOString(),
      });
    }
  }

  // ==============================================================================
  // 1. PUBLIC DISCOVERY ACCESS (Strict Gate: ONLY status === 'published')
  // ==============================================================================

  async getPublishedJobs(): Promise<PublicJob[]> {
    const list: PublicJob[] = [];
    for (const job of this.jobs.values()) {
      if (job.status === "published") {
        list.push({
          id: job.id,
          title: job.title,
          slug: job.slug,
          jobType: job.jobType,
          workplaceType: job.workplaceType,
          city: job.city,
          state: job.state,
          experienceLevel: job.experienceLevel,
          minCompensation: job.minCompensation,
          maxCompensation: job.maxCompensation,
          compensationType: job.compensationType,
          isCompensationNegotiable: job.isCompensationNegotiable,
          description: job.description,
          responsibilities: job.responsibilities,
          requirements: job.requirements,
          perks: job.perks,
          skills: job.skills,
          status: "published",
          publishedAt: job.publishedAt || job.createdAt,
          company: job.company,
        });
      }
    }
    return list.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getPublishedJobBySlug(slug: string): Promise<PublicJob | null> {
    for (const job of this.jobs.values()) {
      if (job.slug === slug && job.status === "published") {
        return {
          id: job.id,
          title: job.title,
          slug: job.slug,
          jobType: job.jobType,
          workplaceType: job.workplaceType,
          city: job.city,
          state: job.state,
          experienceLevel: job.experienceLevel,
          minCompensation: job.minCompensation,
          maxCompensation: job.maxCompensation,
          compensationType: job.compensationType,
          isCompensationNegotiable: job.isCompensationNegotiable,
          description: job.description,
          responsibilities: job.responsibilities,
          requirements: job.requirements,
          perks: job.perks,
          skills: job.skills,
          status: "published",
          publishedAt: job.publishedAt || job.createdAt,
          company: job.company,
        };
      }
    }
    return null;
  }

  // ==============================================================================
  // 2. EMPLOYER JOB MANAGEMENT (IDOR-Hardened)
  // ==============================================================================

  async getJobsByCompany(companyId: string): Promise<JobRecord[]> {
    const list: JobRecord[] = [];
    for (const job of this.jobs.values()) {
      if (job.companyId === companyId) {
        list.push(job);
      }
    }
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getJobById(jobId: string): Promise<JobRecord | null> {
    return this.jobs.get(jobId) || null;
  }

  async createJobDraft(params: {
    employerUserId: string;
    companyId: string;
    title: string;
    jobType: JobRecord["jobType"];
    workplaceType: JobRecord["workplaceType"];
    city: string;
    state: string;
    experienceLevel: JobRecord["experienceLevel"];
    minCompensation: number;
    maxCompensation: number;
    compensationType: JobRecord["compensationType"];
    isCompensationNegotiable: boolean;
    description: string;
    responsibilities: string[];
    requirements: string[];
    perks: string[];
    skills: string[];
    preferredSkills?: string[];
  }): Promise<JobRecord> {
    const company = await employerStore.getCompanyById(params.companyId);
    if (!company) {
      throw new Error("Company record not found.");
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const slugBase = `${params.title}-${company.name}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${slugBase}-${jobId.slice(-6)}`;
    const now = new Date().toISOString();

    const newJob: JobRecord = {
      id: jobId,
      companyId: company.id,
      createdById: params.employerUserId,
      title: params.title.trim(),
      slug,
      jobType: params.jobType,
      workplaceType: params.workplaceType,
      city: params.city.trim(),
      state: params.state.trim(),
      country: "India",
      experienceLevel: params.experienceLevel,
      minCompensation: params.minCompensation,
      maxCompensation: params.maxCompensation,
      compensationType: params.compensationType,
      isCompensationNegotiable: params.isCompensationNegotiable,
      description: params.description.trim(),
      responsibilities: params.responsibilities,
      requirements: params.requirements,
      perks: params.perks,
      skills: params.skills,
      preferredSkills: params.preferredSkills || [],
      acceptsNativeApplications: true,
      status: "draft", // Initial state is strictly draft
      createdAt: now,
      updatedAt: now,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        websiteUrl: company.websiteUrl || `https://${company.corporateDomain}`,
        corporateDomain: company.corporateDomain,
        companySize: company.companySize,
        industry: company.industry,
        headquartersCity: company.headquartersCity,
        about: company.about,
        isVerified: company.verificationStatus === "verified",
      },
    };

    this.jobs.set(jobId, newJob);
    return newJob;
  }

  async updateJobDraft(
    employerUserId: string,
    companyId: string,
    jobId: string,
    data: Partial<Omit<JobRecord, "id" | "companyId" | "createdById" | "createdAt" | "status">>
  ): Promise<JobRecord> {
    const job = this.jobs.get(jobId);
    if (!job || job.companyId !== companyId) {
      throw new Error("Job not found or access denied.");
    }

    if (job.status === "published") {
      // Re-moderation rule: Editing published jobs moves sensitive modifications to pending_moderation
      job.status = "pending_moderation";
    } else if (job.status === "rejected" || job.status === "needs_info") {
      job.status = "draft";
    }

    Object.assign(job, data, { updatedAt: new Date().toISOString() });
    return job;
  }

  async submitJobForModeration(
    employerUserId: string,
    companyId: string,
    jobId: string
  ): Promise<JobRecord> {
    const job = this.jobs.get(jobId);
    if (!job || job.companyId !== companyId) {
      throw new Error("Job not found or access denied.");
    }

    // VERIFIED EMPLOYER GATE
    const company = await employerStore.getCompanyById(companyId);
    if (!company || company.verificationStatus !== "verified") {
      throw new Error(
        `Job submission is restricted until your organization achieves verified status (Current status: ${company?.verificationStatus || "unverified"}).`
      );
    }

    // Validation rules
    if (!job.title || job.title.length < 3) throw new Error("Job title is required.");
    if (!job.description || job.description.length < 30) throw new Error("Description must be at least 30 characters.");
    if (job.minCompensation > job.maxCompensation) throw new Error("Minimum compensation cannot exceed maximum compensation.");
    if (!job.skills || job.skills.length === 0) throw new Error("At least one required skill must be attached.");

    job.status = "pending_moderation";
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async pauseJob(employerUserId: string, companyId: string, jobId: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);
    if (!job || job.companyId !== companyId) {
      throw new Error("Job not found or access denied.");
    }

    if (job.status !== "published") {
      throw new Error("Only published jobs can be paused.");
    }

    job.status = "paused";
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async closeJob(employerUserId: string, companyId: string, jobId: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);
    if (!job || job.companyId !== companyId) {
      throw new Error("Job not found or access denied.");
    }

    job.status = "closed";
    job.updatedAt = new Date().toISOString();
    return job;
  }

  // ==============================================================================
  // 3. ADMIN MODERATION ACTIONS (Admin Role Protected)
  // ==============================================================================

  async getPendingModerationQueue(): Promise<JobRecord[]> {
    const list: JobRecord[] = [];
    for (const job of this.jobs.values()) {
      if (job.status === "pending_moderation") {
        list.push(job);
      }
    }
    return list.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async approveJob(adminId: string, jobId: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error("Job opportunity not found.");
    }

    if (job.status !== "pending_moderation") {
      throw new Error(`Cannot approve job currently in '${job.status}' state.`);
    }

    const prevStatus = job.status;
    const now = new Date().toISOString();

    job.status = "published";
    job.publishedAt = now;
    job.moderatedAt = now;
    job.moderatedById = adminId;
    job.updatedAt = now;

    this.logModerationAudit({
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.company.name,
      adminId,
      action: "APPROVE",
      prevStatus,
      newStatus: "published",
    });

    return job;
  }

  async rejectJob(adminId: string, jobId: string, moderationNote: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error("Job opportunity not found.");
    }

    if (!moderationNote || moderationNote.trim().length < 5) {
      throw new Error("A specific moderation note (min 5 characters) is required when rejecting a listing.");
    }

    const prevStatus = job.status;
    const now = new Date().toISOString();

    job.status = "rejected";
    job.moderationFeedback = moderationNote.trim();
    job.moderatedAt = now;
    job.moderatedById = adminId;
    job.updatedAt = now;

    this.logModerationAudit({
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.company.name,
      adminId,
      action: "REJECT",
      prevStatus,
      newStatus: "rejected",
      moderationNote: moderationNote.trim(),
    });

    return job;
  }

  async requestInfo(adminId: string, jobId: string, moderationNote: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error("Job opportunity not found.");
    }

    if (!moderationNote || moderationNote.trim().length < 5) {
      throw new Error("A specific feedback note (min 5 characters) is required when requesting information.");
    }

    const prevStatus = job.status;
    const now = new Date().toISOString();

    job.status = "needs_info";
    job.moderationFeedback = moderationNote.trim();
    job.moderatedAt = now;
    job.moderatedById = adminId;
    job.updatedAt = now;

    this.logModerationAudit({
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.company.name,
      adminId,
      action: "REQUEST_INFO",
      prevStatus,
      newStatus: "needs_info",
      moderationNote: moderationNote.trim(),
    });

    return job;
  }

  private logModerationAudit(entry: Omit<JobModerationAuditRecord, "id" | "timestamp">) {
    this.moderationAuditLogs.push({
      id: `audit-mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  async getModerationAuditLogs(jobId?: string): Promise<JobModerationAuditRecord[]> {
    if (jobId) {
      return this.moderationAuditLogs.filter((l) => l.jobId === jobId);
    }
    return this.moderationAuditLogs;
  }

  async getAuditLogs(jobId?: string): Promise<JobModerationAuditRecord[]> {
    return this.getModerationAuditLogs(jobId);
  }
}

export const jobStore = new JobStore();
