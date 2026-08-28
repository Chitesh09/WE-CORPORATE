import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ==============================================================================
// 1. ENUMS
// ==============================================================================
export const userRoleEnum = pgEnum("user_role", [
  "candidate",
  "employer",
  "admin",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "pending_verification",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending",
  "verified",
  "rejected",
  "needs_info",
]);

export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "internship",
  "part_time",
  "contract",
]);

export const workplaceTypeEnum = pgEnum("workplace_type", [
  "on_site",
  "hybrid",
  "remote",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "pending_moderation",
  "published",
  "paused",
  "closed",
  "rejected",
]);

export const applicationStageEnum = pgEnum("application_stage", [
  "applied",
  "under_review",
  "shortlisted",
  "not_selected",
  "hired",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "requested",
  "confirmed",
  "completed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "initiated",
  "success",
  "failed",
  "refunded",
]);

export const inquiryTypeEnum = pgEnum("inquiry_type", ["college", "vendor"]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "contacted",
  "in_discussion",
  "onboarded",
  "archived",
]);

// ==============================================================================
// 2. TABLES
// ==============================================================================

// USERS TABLE
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    role: userRoleEnum("role").notNull().default("candidate"),
    status: userStatusEnum("status").notNull().default("active"),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    roleIdx: index("idx_users_role").on(table.role),
  })
);

// CANDIDATE PROFILES
export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  headline: varchar("headline", { length: 255 }),
  bio: text("bio"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  experienceLevel: varchar("experience_level", { length: 50 }),
  education: jsonb("education").default([]),
  skills: text("skills")
    .array()
    .default([]),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  githubUrl: varchar("github_url", { length: 255 }),
  portfolioUrl: varchar("portfolio_url", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// RESUME VAULT (Candidate Personal Vault)
export const resumeVault = pgTable("resume_vault", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  mimeType: varchar("mime_type", { length: 100 })
    .notNull()
    .default("application/pdf"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// EMPLOYER PROFILES (Company Entity)
export const employerProfiles = pgTable(
  "employer_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    companySlug: varchar("company_slug", { length: 255 }).notNull().unique(),
    companyLogoUrl: varchar("company_logo_url", { length: 500 }),
    websiteUrl: varchar("website_url", { length: 255 }),
    corporateDomain: varchar("corporate_domain", { length: 255 }),
    companySize: varchar("company_size", { length: 50 }),
    industry: varchar("industry", { length: 100 }),
    headquartersCity: varchar("headquarters_city", { length: 100 }),
    aboutDescription: text("about_description"),
    verificationStatus: verificationStatusEnum("verification_status")
      .notNull()
      .default("unverified"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    companySlugIdx: index("idx_employer_slug").on(table.companySlug),
  })
);

// EMPLOYER VERIFICATIONS (Evidence & Admin Decision)
export const employerVerifications = pgTable("employer_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  employerId: uuid("employer_id")
    .notNull()
    .references(() => employerProfiles.id, { onDelete: "cascade" }),
  evidenceType: varchar("evidence_type", { length: 100 }).notNull(),
  evidencePayload: jsonb("evidence_payload").notNull(),
  adminNotes: text("admin_notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  decisionAt: timestamp("decision_at", { withTimezone: true }),
  status: verificationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// JOBS TABLE
export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    employerId: uuid("employer_id")
      .notNull()
      .references(() => employerProfiles.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 300 }).notNull().unique(),
    jobType: jobTypeEnum("job_type").notNull(),
    workplaceType: workplaceTypeEnum("workplace_type").notNull(),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    experienceLevel: varchar("experience_level", { length: 50 }).notNull(),
    minCompensation: integer("min_compensation"),
    maxCompensation: integer("max_compensation"),
    compensationType: varchar("compensation_type", { length: 50 })
      .notNull()
      .default("annual_ctc"),
    isCompensationNegotiable: boolean("is_compensation_negotiable")
      .notNull()
      .default(false),
    description: text("description").notNull(),
    requirements: text("requirements"),
    responsibilities: text("responsibilities"),
    perks: text("perks")
      .array()
      .default([]),
    skills: text("skills")
      .array()
      .notNull()
      .default([]),
    status: jobStatusEnum("status").notNull().default("draft"),
    moderationNotes: text("moderation_notes"),
    moderatedBy: uuid("moderated_by").references(() => users.id),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusTypeIdx: index("idx_jobs_status_type").on(
      table.status,
      table.jobType
    ),
    cityIdx: index("idx_jobs_city").on(table.city),
  })
);

// APPLICATIONS TABLE (Immutable Snapshot Pattern)
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    candidateProfileSnapshot: jsonb("candidate_profile_snapshot").notNull(),
    coverNote: varchar("cover_note", { length: 500 }),
    currentStage: applicationStageEnum("current_stage")
      .notNull()
      .default("applied"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uqCandidateJob: unique("uq_candidate_job").on(
      table.jobId,
      table.candidateId
    ),
    jobStageIdx: index("idx_applications_job").on(
      table.jobId,
      table.currentStage
    ),
    candidateIdx: index("idx_applications_candidate").on(table.candidateId),
  })
);

// APPLICATION SUBMITTED RESUMES (Isolated Object Copy)
export const applicationSubmittedResumes = pgTable(
  "application_submitted_resumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .unique()
      .references(() => applications.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    sha256Hash: varchar("sha256_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

// SAVED JOBS (Bookmarking)
export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uqUserJobSaved: unique("uq_user_job_saved").on(table.userId, table.jobId),
  })
);

// CONSULTING BOOKINGS
export const consultingBookings = pgTable("consulting_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  serviceSlug: varchar("service_slug", { length: 100 }).notNull(),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  candidateNotes: text("candidate_notes"),
  resumeStorageKey: varchar("resume_storage_key", { length: 500 }),
  preferredAvailability: jsonb("preferred_availability").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending_payment"),
  assignedConsultantName: varchar("assigned_consultant_name", { length: 255 }),
  confirmedSessionTime: timestamp("confirmed_session_time", {
    withTimezone: true,
  }),
  meetingLink: varchar("meeting_link", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// PAYMENT TRANSACTIONS (Generic Provider Schema)
export const paymentTransactions = pgTable(
  "payment_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => consultingBookings.id, { onDelete: "cascade" }),
    providerName: varchar("provider_name", { length: 50 }).notNull(),
    providerOrderId: varchar("provider_order_id", { length: 255 })
      .notNull()
      .unique(),
    providerPaymentId: varchar("provider_payment_id", { length: 255 }),
    amountInInr: integer("amount_in_inr").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    status: paymentStatusEnum("status").notNull().default("initiated"),
    providerSignature: varchar("provider_signature", { length: 500 }),
    rawWebhookPayload: jsonb("raw_webhook_payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orderIdx: index("idx_payment_order").on(table.providerOrderId),
  })
);

// CONNECT INQUIRIES (College & Vendor Leads)
export const connectInquiries = pgTable(
  "connect_inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: inquiryTypeEnum("type").notNull(),
    organizationName: varchar("organization_name", { length: 255 }).notNull(),
    contactPersonName: varchar("contact_person_name", {
      length: 255,
    }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    details: jsonb("details").notNull(),
    status: inquiryStatusEnum("status").notNull().default("new"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    typeStatusIdx: index("idx_inquiries_type_status").on(
      table.type,
      table.status
    ),
  })
);

// AUDIT LOGS
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id),
    action: varchar("action", { length: 100 }).notNull(),
    targetResource: varchar("target_resource", { length: 100 }).notNull(),
    targetId: uuid("target_id").notNull(),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    actionIdx: index("idx_audit_action").on(table.action, table.createdAt),
  })
);
