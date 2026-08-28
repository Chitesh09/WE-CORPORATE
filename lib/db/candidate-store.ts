import { hashPassword, hashPasswordSync, verifyPassword } from "@/lib/auth/password";
import { UserRole, UserStatus, ApplicationStatus } from "@/types";
import { DEVELOPMENT_JOBS } from "@/lib/db/seed-data";
import { jobStore } from "@/lib/db/job-store";

export interface CandidateProfileData {
  phoneNumber?: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  experienceLevel?: string;
  education?: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }>;
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface CandidateUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  profile: CandidateProfileData;
}

export interface CandidateResumeRecord {
  id: string;
  userId: string;
  fileName: string;
  storageKey: string;
  fileSizeBytes: number;
  mimeType: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface SavedJobRecord {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
}

export interface ApplicationResumeSnapshot {
  id: string;
  applicationId: string;
  originalResumeId: string;
  fileName: string;
  storageKey: string;
  fileSizeBytes: number;
  mimeType: string;
  capturedAt: string;
}

export interface ApplicationProfileSnapshot {
  fullName: string;
  email: string;
  phoneNumber?: string;
  headline?: string;
  city?: string;
  state?: string;
  experienceLevel?: string;
  skills: string[];
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface ApplicationConsentRecord {
  agreedToShareWithEmployer: boolean;
  consentTimestamp: string;
  employerName: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  companyId: string;
  companyName: string;
  status: ApplicationStatus;
  coverNote?: string;
  resumeSnapshot: ApplicationResumeSnapshot;
  profileSnapshot: ApplicationProfileSnapshot;
  consent: ApplicationConsentRecord;
  statusHistory: Array<{
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }>;
  submittedAt: string;
  updatedAt: string;
}

export interface ApplicationStatusAuditRecord {
  id: string;
  applicationId: string;
  jobId: string;
  companyId: string;
  employerUserId: string;
  prevStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  note?: string;
  timestamp: string;
}

// In-Memory / Isolated Repository State for Development & Verification
class CandidateStore {
  private users: Map<string, CandidateUserRecord> = new Map();
  private resumes: Map<string, CandidateResumeRecord> = new Map();
  private savedJobs: Map<string, SavedJobRecord> = new Map();
  private applications: Map<string, ApplicationRecord> = new Map();
  private applicationAuditLogs: ApplicationStatusAuditRecord[] = [];

  constructor() {
    this.seedDefaultCandidate();
  }

  private seedDefaultCandidate() {
    const demoId = "candidate-demo-001";
    const demoPasswordHash = hashPasswordSync("CandidatePass123!");

    const demoCandidate: CandidateUserRecord = {
      id: demoId,
      email: "rahul.sharma@example.com",
      passwordHash: demoPasswordHash,
      fullName: "Rahul Sharma",
      role: "candidate",
      status: "active",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        phoneNumber: "+91 98765 43210",
        headline: "Final-year Computer Science Student | React & Node.js Developer",
        bio: "Passionate software engineering student with hands-on experience in full-stack web applications, TypeScript, and cloud services. Seeking summer internship or entry-level software engineer opportunities in India.",
        city: "Bengaluru",
        state: "Karnataka",
        experienceLevel: "freshers",
        education: [
          {
            degree: "Bachelor of Technology (B.Tech)",
            institution: "National Institute of Technology",
            fieldOfStudy: "Computer Science and Engineering",
            startYear: 2022,
            endYear: 2026,
          },
        ],
        skills: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Git"],
        linkedinUrl: "https://linkedin.com/in/rahul-sharma-demo",
        githubUrl: "https://github.com/rahul-sharma-demo",
        portfolioUrl: "https://rahulsharma.dev",
      },
    };

    this.users.set(demoCandidate.email.toLowerCase(), demoCandidate);

    // Seed a sample primary resume
    const resumeId = "resume-001";
    this.resumes.set(resumeId, {
      id: resumeId,
      userId: demoId,
      fileName: "Rahul_Sharma_Software_Engineer_Resume.pdf",
      storageKey: `candidates/${demoId}/resumes/${resumeId}/Rahul_Sharma_Resume.pdf`,
      fileSizeBytes: 245760, // 240 KB
      mimeType: "application/pdf",
      isPrimary: true,
      uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    });

    // Seed saved jobs for demo candidate
    this.savedJobs.set(`${demoId}:job-001`, {
      id: "saved-001",
      userId: demoId,
      jobId: "job-001",
      savedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    });
    this.savedJobs.set(`${demoId}:job-002`, {
      id: "saved-002",
      userId: demoId,
      jobId: "job-002",
      savedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    });

    // Seed a sample application for demo candidate on job-001
    const sampleAppId = "app-demo-001";
    const appTime = new Date(Date.now() - 2 * 86400000).toISOString();
    this.applications.set(sampleAppId, {
      id: sampleAppId,
      userId: demoId,
      jobId: "job-001",
      jobTitle: "Associate Software Engineer — Frontend",
      jobSlug: "associate-software-engineer-frontend-we-tech-001",
      companyId: "we-technologies-india-pvt-ltd",
      companyName: "WE Technologies India Pvt Ltd",
      status: "applied",
      coverNote: "I have built several responsive React/Next.js projects and would love to contribute to WE Technologies.",
      resumeSnapshot: {
        id: "snap-demo-001",
        applicationId: sampleAppId,
        originalResumeId: resumeId,
        fileName: "Rahul_Sharma_Software_Engineer_Resume.pdf",
        storageKey: `applications/${sampleAppId}/resumes/Rahul_Sharma_Resume.pdf`,
        fileSizeBytes: 245760,
        mimeType: "application/pdf",
        capturedAt: appTime,
      },
      profileSnapshot: {
        fullName: demoCandidate.fullName,
        email: demoCandidate.email,
        phoneNumber: demoCandidate.profile.phoneNumber,
        headline: demoCandidate.profile.headline,
        city: demoCandidate.profile.city,
        state: demoCandidate.profile.state,
        experienceLevel: demoCandidate.profile.experienceLevel,
        skills: [...(demoCandidate.profile.skills || [])],
        bio: demoCandidate.profile.bio,
        linkedinUrl: demoCandidate.profile.linkedinUrl,
        githubUrl: demoCandidate.profile.githubUrl,
        portfolioUrl: demoCandidate.profile.portfolioUrl,
      },
      consent: {
        agreedToShareWithEmployer: true,
        consentTimestamp: appTime,
        employerName: "WE Technologies India Pvt Ltd",
        ipAddress: "127.0.0.1",
        userAgent: "WE CORPORATE Browser Client",
      },
      statusHistory: [
        {
          status: "applied",
          changedAt: appTime,
          note: "Application submitted by candidate via WE CORPORATE 1-Click Pipeline.",
        },
      ],
      submittedAt: appTime,
      updatedAt: appTime,
    });
  }

  // ==========================================
  // 1. CANDIDATE ACCOUNT
  // ==========================================

  async createCandidate(data: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<CandidateUserRecord> {
    const normalizedEmail = data.email.toLowerCase().trim();

    if (this.users.has(normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    const userId = `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const newUser: CandidateUserRecord = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      fullName: data.fullName.trim(),
      role: "candidate",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        skills: [],
        education: [],
      },
    };

    this.users.set(normalizedEmail, newUser);
    return newUser;
  }

  async ensureCandidateFromSession(
    sessionUser: {
      id: string;
      email: string;
      fullName: string;
      role?: UserRole;
      status?: UserStatus;
    },
    profileOverride?: Partial<CandidateProfileData> | null
  ): Promise<CandidateUserRecord> {
    const normalizedEmail = sessionUser.email.toLowerCase().trim();
    let existing = this.users.get(normalizedEmail);
    if (!existing) {
      existing = {
        id: sessionUser.id,
        email: normalizedEmail,
        passwordHash: "",
        fullName: sessionUser.fullName,
        role: "candidate",
        status: sessionUser.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          skills: [],
          education: [],
          ...(profileOverride || {}),
        },
      };
      this.users.set(normalizedEmail, existing);
    } else {
      if (existing.id !== sessionUser.id) {
        existing.id = sessionUser.id;
      }
      if (sessionUser.fullName) {
        existing.fullName = sessionUser.fullName;
      }
      if (profileOverride) {
        existing.profile = {
          ...existing.profile,
          ...profileOverride,
          skills: Array.isArray(profileOverride.skills) ? profileOverride.skills : existing.profile.skills,
        };
      }
    }
    return existing;
  }

  async findByEmail(email: string): Promise<CandidateUserRecord | null> {
    const normalizedEmail = email.toLowerCase().trim();
    return this.users.get(normalizedEmail) || null;
  }

  async findById(userId: string): Promise<CandidateUserRecord | null> {
    for (const user of this.users.values()) {
      if (user.id === userId) return user;
    }
    return null;
  }

  // ==========================================
  // 2. CANDIDATE PROFILE
  // ==========================================

  async getProfile(userId: string): Promise<{ user: CandidateUserRecord; profile: CandidateProfileData } | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    return {
      user,
      profile: user.profile,
    };
  }

  async updateProfile(
    userId: string,
    data: Partial<CandidateProfileData> & { fullName?: string; email?: string }
  ): Promise<CandidateUserRecord> {
    let user = await this.findById(userId);
    if (!user) {
      if (data.email) {
        user = await this.findByEmail(data.email);
      }
      if (!user) {
        const dummyEmail = data.email ? data.email.toLowerCase().trim() : `candidate-${userId}@wecorporate.in`;
        user = {
          id: userId,
          email: dummyEmail,
          passwordHash: "",
          fullName: data.fullName || "Candidate",
          role: "candidate",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profile: {
            skills: [],
            education: [],
          },
        };
        this.users.set(dummyEmail, user);
      }
    }

    if (user.status !== "active") {
      throw new Error("Account is suspended or inactive.");
    }

    if (data.fullName && data.fullName.trim()) {
      user.fullName = data.fullName.trim();
    }

    user.profile = {
      ...user.profile,
      ...data,
      skills: Array.isArray(data.skills) ? data.skills : (user.profile.skills || []),
      education: Array.isArray(data.education) ? data.education : (user.profile.education || []),
    };

    user.updatedAt = new Date().toISOString();
    return user;
  }

  // ==========================================
  // 3. RESUME VAULT (Candidate Personal Vault)
  // ==========================================

  async getResumes(userId: string): Promise<CandidateResumeRecord[]> {
    const userResumes: CandidateResumeRecord[] = [];
    for (const resume of this.resumes.values()) {
      if (resume.userId === userId) {
        userResumes.push(resume);
      }
    }
    return userResumes.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async getResumeById(userId: string, resumeId: string): Promise<CandidateResumeRecord | null> {
    const resume = this.resumes.get(resumeId);
    if (!resume || resume.userId !== userId) {
      return null;
    }
    return resume;
  }

  async addResume(data: {
    userId: string;
    fileName: string;
    storageKey: string;
    fileSizeBytes: number;
    mimeType?: string;
  }): Promise<CandidateResumeRecord> {
    const resumeId = `resume-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const existing = await this.getResumes(data.userId);

    // If this is the first resume, make it primary automatically
    const isPrimary = existing.length === 0;

    const newResume: CandidateResumeRecord = {
      id: resumeId,
      userId: data.userId,
      fileName: data.fileName,
      storageKey: data.storageKey,
      fileSizeBytes: data.fileSizeBytes,
      mimeType: data.mimeType || "application/pdf",
      isPrimary,
      uploadedAt: new Date().toISOString(),
    };

    this.resumes.set(resumeId, newResume);
    return newResume;
  }

  async setPrimaryResume(userId: string, resumeId: string): Promise<void> {
    const target = this.resumes.get(resumeId);
    if (!target || target.userId !== userId) {
      throw new Error("Resume not found or access denied.");
    }

    for (const resume of this.resumes.values()) {
      if (resume.userId === userId) {
        resume.isPrimary = resume.id === resumeId;
      }
    }
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    const target = this.resumes.get(resumeId);
    if (!target || target.userId !== userId) {
      throw new Error("Resume not found or access denied.");
    }

    this.resumes.delete(resumeId);

    // If the deleted resume was primary, elect the next available resume as primary
    if (target.isPrimary) {
      const remaining = await this.getResumes(userId);
      if (remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
    }
  }

  // ==========================================
  // 4. SAVED JOBS (Bookmarking)
  // ==========================================

  async getSavedJobs(userId: string): Promise<SavedJobRecord[]> {
    const list: SavedJobRecord[] = [];
    for (const item of this.savedJobs.values()) {
      if (item.userId === userId) {
        list.push(item);
      }
    }
    return list.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }

  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    return this.savedJobs.has(`${userId}:${jobId}`);
  }

  async saveJob(userId: string, jobId: string): Promise<SavedJobRecord> {
    const key = `${userId}:${jobId}`;
    const existing = this.savedJobs.get(key);
    if (existing) {
      return existing;
    }

    const newSaved: SavedJobRecord = {
      id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      jobId,
      savedAt: new Date().toISOString(),
    };

    this.savedJobs.set(key, newSaved);
    return newSaved;
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const key = `${userId}:${jobId}`;
    this.savedJobs.delete(key);
  }

  // ==========================================
  // 5. NATIVE APPLICATION PIPELINE (Phase 7.3A)
  // ==========================================

  async getApplications(userId: string): Promise<ApplicationRecord[]> {
    const list: ApplicationRecord[] = [];
    for (const app of this.applications.values()) {
      if (app.userId === userId) {
        list.push(app);
      }
    }
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async getApplicationById(userId: string, applicationId: string): Promise<ApplicationRecord | null> {
    const app = this.applications.get(applicationId);
    if (!app || app.userId !== userId) {
      return null;
    }
    return app;
  }

  async hasCandidateApplied(userId: string, jobId: string): Promise<boolean> {
    for (const app of this.applications.values()) {
      if (app.userId === userId && app.jobId === jobId) {
        return true;
      }
    }
    return false;
  }

  async getApplicationByJob(userId: string, jobId: string): Promise<ApplicationRecord | null> {
    for (const app of this.applications.values()) {
      if (app.userId === userId && app.jobId === jobId) {
        return app;
      }
    }
    return null;
  }

  /**
   * Submits a new native application.
   * Performs server-side eligibility check, candidate readiness check,
   * duplicate prevention, and creates an IMMUTABLE resume & profile snapshot.
   */
  async submitApplication(params: {
    userId: string;
    jobId: string;
    resumeId: string;
    coverNote?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ApplicationRecord> {
    // 1. Verify Candidate User & Readiness
    const user = await this.findById(params.userId);
    if (!user) {
      throw new Error("Candidate account not found.");
    }

    if (user.status === "suspended") {
      throw new Error("Your account is currently suspended. Applications cannot be submitted.");
    }

    if (!user.fullName || !user.email) {
      throw new Error("Your profile is incomplete. Please ensure your name and email are configured.");
    }

    // 2. Verify Job Eligibility Server-Side
    const jobFromStore = await jobStore.getJobById(params.jobId);
    const job = jobFromStore || DEVELOPMENT_JOBS.find((j) => j.id === params.jobId);
    if (!job) {
      throw new Error("Opportunity not found.");
    }

    if (job.status !== "published") {
      throw new Error("Applications for this opportunity are no longer being accepted.");
    }

    // 3. Prevent Duplicate Applications (Database Uniqueness Check)
    const alreadyApplied = await this.hasCandidateApplied(params.userId, params.jobId);
    if (alreadyApplied) {
      const existing = await this.getApplicationByJob(params.userId, params.jobId);
      if (existing) return existing; // Idempotent return
      throw new Error("You have already submitted an application for this opportunity.");
    }

    // 4. Verify Resume Ownership & Existence
    const resume = await this.getResumeById(params.userId, params.resumeId);
    if (!resume) {
      throw new Error("Selected resume could not be found in your personal Resume Vault.");
    }

    // 5. Generate Immutable Application ID & Snapshots
    const applicationId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const submissionTime = new Date().toISOString();

    // Immutable Resume Snapshot (independent storage key & metadata)
    const resumeSnapshot: ApplicationResumeSnapshot = {
      id: `snap-res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      applicationId,
      originalResumeId: resume.id,
      fileName: resume.fileName,
      storageKey: `applications/${applicationId}/resumes/${Date.now()}_${resume.fileName}`,
      fileSizeBytes: resume.fileSizeBytes,
      mimeType: resume.mimeType,
      capturedAt: submissionTime,
    };

    // Immutable Profile Snapshot
    const profileSnapshot: ApplicationProfileSnapshot = {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.profile.phoneNumber,
      headline: user.profile.headline,
      city: user.profile.city,
      state: user.profile.state,
      experienceLevel: user.profile.experienceLevel,
      skills: [...(user.profile.skills || [])],
      bio: user.profile.bio,
      linkedinUrl: user.profile.linkedinUrl,
      githubUrl: user.profile.githubUrl,
      portfolioUrl: user.profile.portfolioUrl,
    };

    // Explicit Consent Record
    const consent: ApplicationConsentRecord = {
      agreedToShareWithEmployer: true,
      consentTimestamp: submissionTime,
      employerName: job.company.name,
      ipAddress: params.ipAddress || "127.0.0.1",
      userAgent: params.userAgent || "WE CORPORATE Browser Client",
    };

    const newApplication: ApplicationRecord = {
      id: applicationId,
      userId: user.id,
      jobId: job.id,
      jobTitle: job.title,
      jobSlug: job.slug,
      companyId: job.company.slug,
      companyName: job.company.name,
      status: "applied",
      coverNote: params.coverNote?.trim() ? params.coverNote.trim() : undefined,
      resumeSnapshot,
      profileSnapshot,
      consent,
      statusHistory: [
        {
          status: "applied",
          changedAt: submissionTime,
          note: "Application submitted by candidate via WE CORPORATE 1-Click Pipeline.",
        },
      ],
      submittedAt: submissionTime,
      updatedAt: submissionTime,
    };

    this.applications.set(applicationId, newApplication);
    return newApplication;
  }

  // ==========================================
  // 6. SECURITY & DATA EXPORT
  // ==========================================

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const isValid = await verifyPassword(currentPass, user.passwordHash);
    if (!isValid) {
      throw new Error("Current password is incorrect.");
    }

    user.passwordHash = await hashPassword(newPass);
    user.updatedAt = new Date().toISOString();
  }

  async exportData(userId: string): Promise<{
    account: { id: string; email: string; fullName: string; role: string; createdAt: string };
    profile: CandidateProfileData;
    resumes: Array<{ fileName: string; fileSizeBytes: number; isPrimary: boolean; uploadedAt: string }>;
    savedJobsCount: number;
    applicationsCount: number;
    exportedAt: string;
  }> {
    const user = await this.findById(userId);
    if (!user) throw new Error("Candidate account not found.");

    const resumes = await this.getResumes(userId);
    const saved = await this.getSavedJobs(userId);
    const applications = await this.getApplications(userId);

    return {
      account: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: user.profile,
      resumes: resumes.map((r) => ({
        fileName: r.fileName,
        fileSizeBytes: r.fileSizeBytes,
        isPrimary: r.isPrimary,
        uploadedAt: r.uploadedAt,
      })),
      savedJobsCount: saved.length,
      applicationsCount: applications.length,
      exportedAt: new Date().toISOString(),
    };
  }

  // ==========================================
  // 7. LITE ATS / EMPLOYER APPLICANT METHODS
  // ==========================================

  async getApplicationsForJob(companyId: string, jobId: string): Promise<ApplicationRecord[]> {
    const job = await jobStore.getJobById(jobId);
    if (job && job.companyId !== companyId) {
      return [];
    }

    const list: ApplicationRecord[] = [];
    for (const app of this.applications.values()) {
      if (app.jobId === jobId) {
        list.push(app);
      }
    }
    return list.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async getApplicationForEmployer(
    companyId: string,
    jobId: string,
    applicationId: string
  ): Promise<ApplicationRecord | null> {
    const app = this.applications.get(applicationId);
    if (!app || app.jobId !== jobId) {
      return null;
    }

    const job = await jobStore.getJobById(jobId);
    if (job && job.companyId !== companyId) {
      return null;
    }

    return app;
  }

  async updateApplicationStage(params: {
    employerUserId: string;
    companyId: string;
    jobId: string;
    applicationId: string;
    newStatus: ApplicationStatus;
    note?: string;
  }): Promise<ApplicationRecord> {
    const app = this.applications.get(params.applicationId);
    if (!app || app.jobId !== params.jobId) {
      throw new Error("Application record not found or does not belong to this opportunity.");
    }

    const currentStatus = app.status;
    const { newStatus } = params;

    // Idempotent check
    if (currentStatus === newStatus) {
      return app;
    }

    // State Transition Matrix
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      applied: ["under_review", "not_selected"],
      under_review: ["shortlisted", "not_selected"],
      shortlisted: ["hired", "not_selected"],
      not_selected: [],
      hired: [],
    };

    const allowedNext = validTransitions[currentStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new Error(
        `Invalid stage transition: cannot move application from '${currentStatus}' to '${newStatus}'.`
      );
    }

    const now = new Date().toISOString();
    app.status = newStatus;
    app.updatedAt = now;
    app.statusHistory.push({
      status: newStatus,
      changedAt: now,
      note: params.note || `Stage updated to ${newStatus.replace("_", " ")} by recruiter.`,
    });

    // Audit Logging
    this.applicationAuditLogs.push({
      id: `audit-app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      applicationId: app.id,
      jobId: app.jobId,
      companyId: params.companyId,
      employerUserId: params.employerUserId,
      prevStatus: currentStatus,
      newStatus,
      note: params.note,
      timestamp: now,
    });

    return app;
  }

  async getApplicationAuditLogs(applicationId?: string): Promise<ApplicationStatusAuditRecord[]> {
    if (applicationId) {
      return this.applicationAuditLogs.filter((l) => l.applicationId === applicationId);
    }
    return this.applicationAuditLogs;
  }
}

// Global Singleton Store Instance
export const candidateStore = new CandidateStore();
