import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { UserRole, UserStatus, VerificationStatus } from "@/types";

export interface CompanyRecord {
  id: string;
  name: string;
  slug: string;
  websiteUrl?: string;
  corporateDomain: string;
  companySize: string;
  industry: string;
  headquartersCity: string;
  headquartersState?: string;
  about: string;
  logoUrl?: string;
  publicContactEmail?: string;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: string;
  verificationApprovedAt?: string;
  verificationRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  companyId: string;
  designation?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationSubmissionRecord {
  id: string;
  companyId: string;
  submittedByUserId: string;
  businessRegistrationType: "CIN" | "GSTIN" | "LLPIN" | "Udyam" | "IncorporationCertificate" | "Other";
  registrationNumber: string;
  documentFileName?: string;
  documentStorageKey?: string;
  documentSizeBytes?: number;
  officialWebsite: string;
  authorizationNote?: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  adminNotes?: string;
}

export interface EmployerAuditLogRecord {
  id: string;
  userId: string;
  companyId: string;
  action: "EMPLOYER_REGISTERED" | "COMPANY_PROFILE_UPDATED" | "VERIFICATION_SUBMITTED" | "PASSWORD_CHANGED";
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class EmployerStore {
  private users: Map<string, EmployerUserRecord> = new Map();
  private companies: Map<string, CompanyRecord> = new Map();
  private verifications: Map<string, VerificationSubmissionRecord> = new Map();
  private auditLogs: EmployerAuditLogRecord[] = [];

  constructor() {
    this.seedDefaultEmployer();
  }

  private async seedDefaultEmployer() {
    const demoCompanyId = "company-demo-001";
    const demoEmployerId = "employer-demo-001";
    const demoPasswordHash = await hashPassword("EmployerPass123!");

    const demoCompany: CompanyRecord = {
      id: demoCompanyId,
      name: "Razorpay Software Pvt Ltd",
      slug: "razorpay",
      websiteUrl: "https://razorpay.com",
      corporateDomain: "razorpay.com",
      companySize: "1000-5000 employees",
      industry: "Financial Technology / Payments",
      headquartersCity: "Bengaluru",
      headquartersState: "Karnataka",
      about: "Razorpay is India's leading full-stack financial solutions company powering millions of businesses.",
      publicContactEmail: "careers@razorpay.com",
      verificationStatus: "verified",
      verificationApprovedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const demoEmployer: EmployerUserRecord = {
      id: demoEmployerId,
      email: "recruiter@razorpay.com",
      passwordHash: demoPasswordHash,
      fullName: "Ananya Deshmukh",
      role: "employer",
      status: "active",
      companyId: demoCompanyId,
      designation: "Lead Technical Recruiter",
      phoneNumber: "+91 98111 22334",
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.companies.set(demoCompanyId, demoCompany);
    this.users.set(demoEmployer.email.toLowerCase(), demoEmployer);
  }

  // ==============================================================================
  // 1. EMPLOYER ACCOUNT MANAGEMENT
  // ==============================================================================

  async createEmployer(data: {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
  }): Promise<{ user: EmployerUserRecord; company: CompanyRecord }> {
    const normalizedEmail = data.email.toLowerCase().trim();

    if (this.users.has(normalizedEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    const domain = normalizedEmail.split("@")[1] || "company.com";
    const passwordHash = await hashPassword(data.password);

    const companyId = `company-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const userId = `employer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const slug = data.companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newCompany: CompanyRecord = {
      id: companyId,
      name: data.companyName.trim(),
      slug: slug || `company-${Date.now()}`,
      corporateDomain: domain,
      companySize: "10-50 employees",
      industry: "Technology / Software",
      headquartersCity: "Bengaluru",
      about: `${data.companyName} is a verified hiring partner on WE CORPORATE.`,
      verificationStatus: "unverified",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newEmployer: EmployerUserRecord = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      fullName: data.fullName.trim(),
      role: "employer",
      status: "active",
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.companies.set(companyId, newCompany);
    this.users.set(normalizedEmail, newEmployer);

    this.logAudit({
      userId,
      companyId,
      action: "EMPLOYER_REGISTERED",
      metadata: { companyName: data.companyName, domain },
    });

    return { user: newEmployer, company: newCompany };
  }

  async ensureEmployerFromSession(sessionUser: {
    id: string;
    email: string;
    fullName: string;
    companyId?: string;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<{ user: EmployerUserRecord; company: CompanyRecord }> {
    const normalizedEmail = sessionUser.email.toLowerCase().trim();
    let existingUser = this.users.get(normalizedEmail);
    const companyId = sessionUser.companyId || existingUser?.companyId || `company-${sessionUser.id}`;
    let existingCompany = this.companies.get(companyId);

    if (!existingCompany) {
      existingCompany = {
        id: companyId,
        name: "Corporate Employer",
        slug: `company-${Date.now()}`,
        corporateDomain: normalizedEmail.split("@")[1] || "company.com",
        companySize: "10-50 employees",
        industry: "Technology / Software",
        headquartersCity: "Bengaluru",
        about: "Verified hiring partner on WE CORPORATE.",
        verificationStatus: "unverified",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.companies.set(companyId, existingCompany);
    }

    if (!existingUser) {
      existingUser = {
        id: sessionUser.id,
        email: normalizedEmail,
        passwordHash: "",
        fullName: sessionUser.fullName,
        role: "employer",
        status: sessionUser.status || "active",
        companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.set(normalizedEmail, existingUser);
    } else {
      if (existingUser.id !== sessionUser.id) {
        existingUser.id = sessionUser.id;
      }
      if (sessionUser.companyId && existingUser.companyId !== sessionUser.companyId) {
        existingUser.companyId = sessionUser.companyId;
      }
    }

    return { user: existingUser, company: existingCompany };
  }

  async findByEmail(email: string): Promise<EmployerUserRecord | null> {
    const normalizedEmail = email.toLowerCase().trim();
    return this.users.get(normalizedEmail) || null;
  }

  async findById(userId: string): Promise<EmployerUserRecord | null> {
    for (const user of this.users.values()) {
      if (user.id === userId) return user;
    }
    return null;
  }

  // ==============================================================================
  // 2. COMPANY PROFILE MANAGEMENT (IDOR-Hardened)
  // ==============================================================================

  async getCompanyById(companyId: string): Promise<CompanyRecord | null> {
    return this.companies.get(companyId) || null;
  }

  async getCompanyForEmployer(userId: string): Promise<{ company: CompanyRecord; user: EmployerUserRecord } | null> {
    const user = await this.findById(userId);
    if (!user || user.role !== "employer") return null;

    let company = this.companies.get(user.companyId);
    if (!company) {
      company = {
        id: user.companyId,
        name: "Corporate Employer",
        slug: `company-${Date.now()}`,
        corporateDomain: user.email.split("@")[1] || "company.com",
        companySize: "10-50 employees",
        industry: "Technology / Software",
        headquartersCity: "Bengaluru",
        about: "Verified hiring partner on WE CORPORATE.",
        verificationStatus: "unverified",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.companies.set(user.companyId, company);
    }

    return { company, user };
  }

  async updateCompanyProfile(
    userId: string,
    data: Partial<Omit<CompanyRecord, "id" | "verificationStatus" | "createdAt" | "updatedAt">>
  ): Promise<CompanyRecord> {
    const user = await this.findById(userId);
    if (!user || user.role !== "employer") {
      throw new Error("Unauthorized: Employer account not found.");
    }
    if (user.status !== "active") {
      throw new Error("Unauthorized: Employer account is suspended or inactive.");
    }

    const company = this.companies.get(user.companyId);
    if (!company) {
      throw new Error("Company profile not found.");
    }

    if (data.name && data.name.trim()) company.name = data.name.trim();
    if (data.websiteUrl !== undefined) company.websiteUrl = data.websiteUrl?.trim();
    if (data.industry !== undefined) company.industry = data.industry.trim();
    if (data.companySize !== undefined) company.companySize = data.companySize.trim();
    if (data.headquartersCity !== undefined) company.headquartersCity = data.headquartersCity.trim();
    if (data.headquartersState !== undefined) company.headquartersState = data.headquartersState.trim();
    if (data.about !== undefined) company.about = data.about.trim();
    if (data.publicContactEmail !== undefined) company.publicContactEmail = data.publicContactEmail.trim();

    company.updatedAt = new Date().toISOString();

    this.logAudit({
      userId,
      companyId: company.id,
      action: "COMPANY_PROFILE_UPDATED",
      metadata: { updatedFields: Object.keys(data) },
    });

    return company;
  }

  // ==============================================================================
  // 3. EMPLOYER VERIFICATION STATE MACHINE
  // ==============================================================================

  async submitVerificationEvidence(params: {
    userId: string;
    businessRegistrationType: VerificationSubmissionRecord["businessRegistrationType"];
    registrationNumber: string;
    documentFileName?: string;
    documentStorageKey?: string;
    documentSizeBytes?: number;
    officialWebsite: string;
    authorizationNote?: string;
  }): Promise<VerificationSubmissionRecord> {
    const user = await this.findById(params.userId);
    if (!user || user.role !== "employer") {
      throw new Error("Unauthorized: Employer identity required.");
    }

    if (user.status === "suspended") {
      throw new Error("Your employer account is currently suspended.");
    }

    const company = this.companies.get(user.companyId);
    if (!company) {
      throw new Error("Company record not found.");
    }

    // State machine check: Cannot submit if already verified
    if (company.verificationStatus === "verified") {
      throw new Error("Your company is already verified.");
    }

    const submissionId = `verif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const submissionTime = new Date().toISOString();

    const submission: VerificationSubmissionRecord = {
      id: submissionId,
      companyId: company.id,
      submittedByUserId: user.id,
      businessRegistrationType: params.businessRegistrationType,
      registrationNumber: params.registrationNumber.trim().toUpperCase(),
      documentFileName: params.documentFileName,
      documentStorageKey: params.documentStorageKey,
      documentSizeBytes: params.documentSizeBytes,
      officialWebsite: params.officialWebsite.trim(),
      authorizationNote: params.authorizationNote?.trim(),
      status: "pending",
      submittedAt: submissionTime,
    };

    // Transition company verification status to pending review
    company.verificationStatus = "pending";
    company.verificationSubmittedAt = submissionTime;
    company.updatedAt = submissionTime;

    this.verifications.set(company.id, submission);

    this.logAudit({
      userId: user.id,
      companyId: company.id,
      action: "VERIFICATION_SUBMITTED",
      metadata: { registrationType: params.businessRegistrationType, regNumber: params.registrationNumber },
    });

    return submission;
  }

  async getVerificationSubmission(userId: string): Promise<VerificationSubmissionRecord | null> {
    const user = await this.findById(userId);
    if (!user || user.role !== "employer") return null;
    return this.verifications.get(user.companyId) || null;
  }

  // ==============================================================================
  // 4. JOB POSTING AUTHORIZATION GATE
  // ==============================================================================

  async canEmployerPostJobs(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await this.findById(userId);
    if (!user || user.role !== "employer") {
      return { allowed: false, reason: "Employer account required." };
    }

    if (user.status === "suspended") {
      return { allowed: false, reason: "Account suspended." };
    }

    const company = this.companies.get(user.companyId);
    if (!company) {
      return { allowed: false, reason: "Company not found." };
    }

    if (company.verificationStatus !== "verified") {
      return {
        allowed: false,
        reason: `Job posting is restricted until Admin trust verification is approved (Current status: ${company.verificationStatus}).`,
      };
    }

    return { allowed: true };
  }

  // ==============================================================================
  // 5. SECURITY & AUDIT
  // ==============================================================================

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

    this.logAudit({
      userId: user.id,
      companyId: user.companyId,
      action: "PASSWORD_CHANGED",
    });
  }

  private logAudit(entry: Omit<EmployerAuditLogRecord, "id" | "timestamp">) {
    this.auditLogs.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  async getAuditLogs(companyId: string): Promise<EmployerAuditLogRecord[]> {
    return this.auditLogs.filter((log) => log.companyId === companyId);
  }
}

export const employerStore = new EmployerStore();
