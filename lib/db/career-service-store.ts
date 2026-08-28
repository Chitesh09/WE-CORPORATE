export interface CareerServiceRecord {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  deliverables: string[];
  durationMinutes: number;
  priceInr: number;
  category: "resume_review" | "mock_interview" | "career_strategy" | "profile_audit";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityIntake {
  preferredDate: string;
  alternativeDate: string;
  preferredTimeSlot: "morning" | "afternoon" | "evening" | "weekend";
  timeZone: string;
  careerGoal: string;
  specificQuestions?: string;
  targetRole?: string;
  resumeId?: string;
  resumeFileName?: string;
}

export type PaymentStatus = "payment_pending" | "paid" | "payment_failed" | "refunded";
export type FulfillmentStatus =
  | "fulfillment_pending"
  | "assigned"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface CareerServiceOrderRecord {
  id: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  amountInInr: number;
  currency: "INR";
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentProvider: "razorpay";
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  intake: AvailabilityIntake;
  assignedConsultantId?: string;
  assignedConsultantName?: string;
  confirmedSessionTime?: string;
  consultantNotes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  completedAt?: string;
}

export interface ConsultantRecord {
  id: string;
  name: string;
  title: string;
  organization: string;
  expertise: string[];
  isActive: boolean;
}

export interface CareerServiceAuditRecord {
  id: string;
  orderId: string;
  actorId: string;
  actorRole: "candidate" | "admin" | "system";
  action:
    | "ORDER_CREATED"
    | "PAYMENT_INITIATED"
    | "PAYMENT_VERIFIED"
    | "PAYMENT_FAILED"
    | "FULFILLMENT_ASSIGNED"
    | "SESSION_CONFIRMED"
    | "SESSION_COMPLETED"
    | "CANCELLATION"
    | "REFUND";
  prevPaymentStatus?: PaymentStatus;
  newPaymentStatus?: PaymentStatus;
  prevFulfillmentStatus?: FulfillmentStatus;
  newFulfillmentStatus?: FulfillmentStatus;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export const INITIAL_CAREER_SERVICES: CareerServiceRecord[] = [
  {
    id: "cs-001",
    slug: "resume-review",
    name: "1-on-1 Comprehensive Resume Teardown & Optimization",
    tagline: "Benchmark your resume against top engineering and corporate standards.",
    description:
      "A structured 45-minute advisory session with a seasoned corporate recruiter or engineering hiring manager. We analyze your project framing, ATS formatting, keyword density, and technical storytelling to maximize interview callbacks.",
    deliverables: [
      "45-minute live 1-on-1 advisory session",
      "Detailed line-by-line feedback on technical impact framing",
      "ATS formatting and readability verification",
      "Actionable revisions checklist tailored to your target roles",
    ],
    durationMinutes: 45,
    priceInr: 1499,
    category: "resume_review",
    isActive: true,
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cs-002",
    slug: "mock-interview",
    name: "Technical & Behavioral Mock Interview Session",
    tagline: "Simulate a real-world tech interview with live structured feedback.",
    description:
      "Practice under realistic interview conditions. Includes 45 minutes of live technical/behavioral questioning followed by 15 minutes of candid, actionable feedback on problem-solving communication and delivery.",
    deliverables: [
      "60-minute comprehensive mock interview session",
      "Realistic algorithmic or full-stack architectural problem sets",
      "Behavioral STAR method communication evaluation",
      "Written score rubric and improvement roadmap",
    ],
    durationMinutes: 60,
    priceInr: 2499,
    category: "mock_interview",
    isActive: true,
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cs-003",
    slug: "career-strategy",
    name: "Early-Career Strategy & Placement Advisory",
    tagline: "Strategic roadmap for students and fresh graduates entering Indian tech.",
    description:
      "Personalized 1-on-1 guidance to help you navigate campus placements, off-campus applications, tier-1 tech expectations, and startup opportunities across India.",
    deliverables: [
      "45-minute personalized strategy consultation",
      "Target company tiering and outreach strategy",
      "Skills gap analysis and suggested portfolio projects",
      "Salary benchmark and compensation guidance",
    ],
    durationMinutes: 45,
    priceInr: 1999,
    category: "career_strategy",
    isActive: true,
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "cs-004",
    slug: "profile-audit",
    name: "LinkedIn & GitHub Technical Portfolio Audit",
    tagline: "Transform your online presence into a high-inbound recruiter magnet.",
    description:
      "Get your public professional assets audited for maximum recruiter engagement. We optimize your headline, about summary, GitHub READMEs, pinned repositories, and project documentation.",
    deliverables: [
      "30-minute portfolio walkthrough",
      "GitHub repo presentation and architecture documentation review",
      "LinkedIn algorithm optimization guidelines",
      "Profile positioning feedback tailored to your niche",
    ],
    durationMinutes: 30,
    priceInr: 999,
    category: "profile_audit",
    isActive: true,
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
  },
];

export const INITIAL_CONSULTANTS: ConsultantRecord[] = [
  {
    id: "cns-001",
    name: "Vikram Sengupta",
    title: "Senior Engineering Manager",
    organization: "Razorpay",
    expertise: ["Full-Stack Architecture", "System Design", "Hiring Rubrics"],
    isActive: true,
  },
  {
    id: "cns-002",
    name: "Dr. Ananya Nair",
    title: "Head of Talent & Leadership",
    organization: "WE Technologies",
    expertise: ["Behavioral Interviewing", "Resume Storytelling", "Early Career Coaching"],
    isActive: true,
  },
  {
    id: "cns-003",
    name: "Siddharth Rao",
    title: "Principal Cloud Architect",
    organization: "Amazon Web Services",
    expertise: ["Cloud Systems", "Go/Distributed Systems", "Placement Prep"],
    isActive: true,
  },
];

class CareerServiceStore {
  private services: Map<string, CareerServiceRecord> = new Map();
  private orders: Map<string, CareerServiceOrderRecord> = new Map();
  private consultants: Map<string, ConsultantRecord> = new Map();
  private auditLogs: CareerServiceAuditRecord[] = [];
  private processedWebhookEvents: Set<string> = new Set();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    for (const service of INITIAL_CAREER_SERVICES) {
      this.services.set(service.slug, service);
    }
    for (const consultant of INITIAL_CONSULTANTS) {
      this.consultants.set(consultant.id, consultant);
    }
  }

  // ==========================================
  // 1. SERVICES CATALOG
  // ==========================================

  async getActiveServices(): Promise<CareerServiceRecord[]> {
    return Array.from(this.services.values()).filter((s) => s.isActive);
  }

  async getServiceBySlug(slug: string): Promise<CareerServiceRecord | null> {
    const service = this.services.get(slug);
    if (!service || !service.isActive) return null;
    return service;
  }

  async getServiceById(id: string): Promise<CareerServiceRecord | null> {
    for (const s of this.services.values()) {
      if (s.id === id) return s;
    }
    return null;
  }

  // ==========================================
  // 2. ORDER CREATION (Server-Enforced Price Integrity)
  // ==========================================

  async createOrder(params: {
    userId: string;
    candidateName: string;
    candidateEmail: string;
    serviceSlug: string;
    intake: AvailabilityIntake;
  }): Promise<CareerServiceOrderRecord> {
    const service = await this.getServiceBySlug(params.serviceSlug);
    if (!service) {
      throw new Error("Requested career service is unavailable or inactive.");
    }

    const orderId = `ord_cs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    // Price is strictly retrieved from the database, never from client input
    const newOrder: CareerServiceOrderRecord = {
      id: orderId,
      userId: params.userId,
      candidateName: params.candidateName,
      candidateEmail: params.candidateEmail,
      serviceId: service.id,
      serviceSlug: service.slug,
      serviceName: service.name,
      amountInInr: service.priceInr, // Server-side source of truth
      currency: "INR",
      paymentStatus: "payment_pending",
      fulfillmentStatus: "fulfillment_pending",
      paymentProvider: "razorpay",
      providerOrderId: `order_rzp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      intake: params.intake,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(orderId, newOrder);

    this.logAudit({
      orderId,
      actorId: params.userId,
      actorRole: "candidate",
      action: "ORDER_CREATED",
      newPaymentStatus: "payment_pending",
      newFulfillmentStatus: "fulfillment_pending",
      metadata: { serviceSlug: service.slug, amountInInr: service.priceInr },
    });

    return newOrder;
  }

  // ==========================================
  // 3. ORDER QUERIES & IDOR PROTECTION
  // ==========================================

  async getOrderById(orderId: string): Promise<CareerServiceOrderRecord | null> {
    return this.orders.get(orderId) || null;
  }

  async getOrdersForCandidate(userId: string): Promise<CareerServiceOrderRecord[]> {
    const list: CareerServiceOrderRecord[] = [];
    for (const order of this.orders.values()) {
      if (order.userId === userId) {
        list.push(order);
      }
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAllOrdersForAdmin(): Promise<CareerServiceOrderRecord[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // ==========================================
  // 4. PAYMENT CONFIRMATION & WEBHOOK VERIFICATION
  // ==========================================

  async recordPaymentSuccess(params: {
    orderId: string;
    paymentId: string;
    signature?: string;
    amountPaidInInr: number;
    currency: string;
    eventId?: string;
  }): Promise<CareerServiceOrderRecord> {
    // Idempotent webhook check
    if (params.eventId && this.processedWebhookEvents.has(params.eventId)) {
      const existing = this.orders.get(params.orderId);
      if (existing) return existing;
    }

    const order = this.orders.get(params.orderId);
    if (!order) {
      throw new Error(`Order ${params.orderId} not found.`);
    }

    // Verify Amount & Currency
    if (params.amountPaidInInr !== order.amountInInr) {
      throw new Error(
        `Payment amount mismatch: expected ₹${order.amountInInr}, received ₹${params.amountPaidInInr}.`
      );
    }

    if (params.currency !== "INR") {
      throw new Error(`Payment currency mismatch: expected INR, received ${params.currency}.`);
    }

    if (order.paymentStatus === "paid") {
      return order; // Idempotent success
    }

    const now = new Date().toISOString();
    order.paymentStatus = "paid";
    order.fulfillmentStatus = "fulfillment_pending";
    order.providerPaymentId = params.paymentId;
    order.providerSignature = params.signature;
    order.paidAt = now;
    order.updatedAt = now;

    if (params.eventId) {
      this.processedWebhookEvents.add(params.eventId);
    }

    this.logAudit({
      orderId: order.id,
      actorId: "system",
      actorRole: "system",
      action: "PAYMENT_VERIFIED",
      prevPaymentStatus: "payment_pending",
      newPaymentStatus: "paid",
      newFulfillmentStatus: "fulfillment_pending",
      metadata: { paymentId: params.paymentId, amountPaidInInr: params.amountPaidInInr },
    });

    return order;
  }

  async recordPaymentFailure(params: {
    orderId: string;
    reason?: string;
    eventId?: string;
  }): Promise<CareerServiceOrderRecord> {
    const order = this.orders.get(params.orderId);
    if (!order) {
      throw new Error(`Order ${params.orderId} not found.`);
    }

    if (order.paymentStatus === "paid") {
      return order; // Cannot fail an already paid order
    }

    const now = new Date().toISOString();
    order.paymentStatus = "payment_failed";
    order.updatedAt = now;

    if (params.eventId) {
      this.processedWebhookEvents.add(params.eventId);
    }

    this.logAudit({
      orderId: order.id,
      actorId: "system",
      actorRole: "system",
      action: "PAYMENT_FAILED",
      prevPaymentStatus: order.paymentStatus,
      newPaymentStatus: "payment_failed",
      metadata: { reason: params.reason },
    });

    return order;
  }

  // ==========================================
  // 5. ADMIN FULFILLMENT & CONSULTANT ASSIGNMENT
  // ==========================================

  async getActiveConsultants(): Promise<ConsultantRecord[]> {
    return Array.from(this.consultants.values()).filter((c) => c.isActive);
  }

  async assignConsultant(params: {
    adminId: string;
    orderId: string;
    consultantId: string;
  }): Promise<CareerServiceOrderRecord> {
    const order = this.orders.get(params.orderId);
    if (!order) {
      throw new Error("Consultation order not found.");
    }

    if (order.paymentStatus !== "paid") {
      throw new Error("Cannot assign consultant to an unpaid booking order.");
    }

    const consultant = this.consultants.get(params.consultantId);
    if (!consultant || !consultant.isActive) {
      throw new Error("Selected consultant is not available.");
    }

    const prevFulfillment = order.fulfillmentStatus;
    const now = new Date().toISOString();

    order.assignedConsultantId = consultant.id;
    order.assignedConsultantName = `${consultant.name} (${consultant.title}, ${consultant.organization})`;
    order.fulfillmentStatus = "assigned";
    order.updatedAt = now;

    this.logAudit({
      orderId: order.id,
      actorId: params.adminId,
      actorRole: "admin",
      action: "FULFILLMENT_ASSIGNED",
      prevFulfillmentStatus: prevFulfillment,
      newFulfillmentStatus: "assigned",
      metadata: { consultantId: consultant.id, consultantName: consultant.name },
    });

    return order;
  }

  async confirmSession(params: {
    adminId: string;
    orderId: string;
    confirmedSessionTime: string;
    notes?: string;
  }): Promise<CareerServiceOrderRecord> {
    const order = this.orders.get(params.orderId);
    if (!order) {
      throw new Error("Consultation order not found.");
    }

    if (order.paymentStatus !== "paid") {
      throw new Error("Cannot confirm session for an unpaid order.");
    }

    if (!order.assignedConsultantId) {
      throw new Error("A consultant must be assigned before confirming session time.");
    }

    const prevFulfillment = order.fulfillmentStatus;
    const now = new Date().toISOString();

    order.confirmedSessionTime = params.confirmedSessionTime;
    if (params.notes) order.consultantNotes = params.notes;
    order.fulfillmentStatus = "confirmed";
    order.updatedAt = now;

    this.logAudit({
      orderId: order.id,
      actorId: params.adminId,
      actorRole: "admin",
      action: "SESSION_CONFIRMED",
      prevFulfillmentStatus: prevFulfillment,
      newFulfillmentStatus: "confirmed",
      metadata: { confirmedSessionTime: params.confirmedSessionTime },
    });

    return order;
  }

  async completeSession(params: {
    adminId: string;
    orderId: string;
    closingNotes?: string;
  }): Promise<CareerServiceOrderRecord> {
    const order = this.orders.get(params.orderId);
    if (!order) {
      throw new Error("Consultation order not found.");
    }

    if (order.fulfillmentStatus !== "confirmed") {
      throw new Error("Only confirmed sessions can be marked as completed.");
    }

    const prevFulfillment = order.fulfillmentStatus;
    const now = new Date().toISOString();

    order.fulfillmentStatus = "completed";
    order.completedAt = now;
    if (params.closingNotes) order.consultantNotes = params.closingNotes;
    order.updatedAt = now;

    this.logAudit({
      orderId: order.id,
      actorId: params.adminId,
      actorRole: "admin",
      action: "SESSION_COMPLETED",
      prevFulfillmentStatus: prevFulfillment,
      newFulfillmentStatus: "completed",
    });

    return order;
  }

  // ==========================================
  // 6. AUDIT LOGGING
  // ==========================================

  private logAudit(entry: Omit<CareerServiceAuditRecord, "id" | "timestamp">) {
    this.auditLogs.push({
      id: `audit_cs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  async getAuditLogs(orderId?: string): Promise<CareerServiceAuditRecord[]> {
    if (orderId) {
      return this.auditLogs.filter((l) => l.orderId === orderId);
    }
    return this.auditLogs;
  }
}

export const careerServiceStore = new CareerServiceStore();
