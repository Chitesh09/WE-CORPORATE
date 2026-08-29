// Role Types
export type UserRole = "candidate" | "employer" | "admin";
export type UserStatus = "active" | "suspended" | "pending_verification";

// Verification Status
export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "needs_info";

// Job Types
export type JobType = "full_time" | "internship" | "part_time" | "contract";
export type WorkplaceType = "on_site" | "hybrid" | "remote";
export type JobStatus =
  | "draft"
  | "pending_moderation"
  | "published"
  | "paused"
  | "closed"
  | "rejected";

// Application Stages
export type ApplicationStage =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "not_selected"
  | "hired";

export type ApplicationStatus = ApplicationStage;

// Screening Question & Answer Models
export interface ScreeningQuestion {
  id: string;
  question: string;
  type: "text" | "yes_no" | "number";
  required: boolean;
  idealAnswer?: string;
}

export interface ScreeningAnswer {
  questionId: string;
  question: string;
  answer: string;
}

// Session User Model
export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
}

// Generic Action Response
export type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

// Generic Payment Provider Interface
export interface IPaymentProvider {
  createOrder(params: {
    amountInInr: number;
    receiptId: string;
    customerEmail: string;
    metadata: Record<string, unknown>;
  }): Promise<{ providerOrderId: string; amount: number; currency: string }>;

  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<boolean>;

  verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string,
    webhookSecret: string
  ): boolean;
}

// Generic AI Guidance Provider Interface
export interface IAIService {
  generateGuidanceResponse(params: {
    userQuery: string;
    conversationHistory: { role: "user" | "assistant"; text: string }[];
    groundedContext: string;
  }): Promise<{
    answer: string;
    suggestedDeepLink?: { label: string; url: string };
  }>;
}
