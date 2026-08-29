"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResult } from "@/types";

export interface CollegePartnershipRecord {
  id: string;
  referenceCode: string;
  institutionName: string;
  affiliationType: string;
  tpoHeadName: string;
  officialEmail: string;
  phoneNumber: string;
  state: string;
  city: string;
  estimatedBatchSize: number;
  preferredHiringModes: string[];
  comments?: string;
  status: "new" | "reviewing" | "partnered" | "scheduled";
  createdAt: string;
}

export interface CampusDriveRegistrationRecord {
  id: string;
  driveId: string;
  registrantType: "student" | "tpo_institution";
  fullName: string;
  email: string;
  collegeName: string;
  graduationYear: string;
  phoneNumber?: string;
  registeredAt: string;
}

// In-Memory Global Store for Institutional Leads
class CollegeStore {
  private partnerships: Map<string, CollegePartnershipRecord> = new Map();
  private registrations: Map<string, CampusDriveRegistrationRecord> = new Map();

  constructor() {
    this.seedInitialLeads();
  }

  private seedInitialLeads() {
    const seedId = "lead-nit-001";
    this.partnerships.set(seedId, {
      id: seedId,
      referenceCode: "WEC-NIT-2026",
      institutionName: "National Institute of Technology, Karnataka (NITK)",
      affiliationType: "Institute of National Importance (INI / Autonomous)",
      tpoHeadName: "Dr. Rameshwar Rao (Head, T&P Cell)",
      officialEmail: "placements@nitk.edu.in",
      phoneNumber: "+91 98450 12345",
      state: "Karnataka",
      city: "Surathkal / Mangalore",
      estimatedBatchSize: 650,
      preferredHiringModes: ["On-Campus Pooled Drive", "6-Month Fast-Track Internships", "Virtual Hackathon"],
      comments: "Interested in organizing exclusive Day-1 hiring drives for 2026 CSE & ECE graduating batches.",
      status: "partnered",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    });

    const seedId2 = "lead-vit-002";
    this.partnerships.set(seedId2, {
      id: seedId2,
      referenceCode: "WEC-VIT-2026",
      institutionName: "Vellore Institute of Technology (VIT)",
      affiliationType: "Deemed University (NAAC A++)",
      tpoHeadName: "Prof. S. Balasubramanian",
      officialEmail: "pat.office@vit.ac.in",
      phoneNumber: "+91 94432 98765",
      state: "Tamil Nadu",
      city: "Vellore",
      estimatedBatchSize: 1200,
      preferredHiringModes: ["Virtual Online Assessment", "6-Month Fast-Track Internships"],
      comments: "Seeking product engineering startup cohorts for B.Tech CSE & Data Science students.",
      status: "reviewing",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    });
  }

  async addPartnership(data: Omit<CollegePartnershipRecord, "id" | "referenceCode" | "status" | "createdAt">): Promise<CollegePartnershipRecord> {
    const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const shortCode = data.institutionName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
    const referenceCode = `WEC-${shortCode || "COL"}-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: CollegePartnershipRecord = {
      ...data,
      id,
      referenceCode,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    this.partnerships.set(id, record);
    return record;
  }

  async addRegistration(data: Omit<CampusDriveRegistrationRecord, "id" | "registeredAt">): Promise<CampusDriveRegistrationRecord> {
    const id = `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record: CampusDriveRegistrationRecord = {
      ...data,
      id,
      registeredAt: new Date().toISOString(),
    };

    this.registrations.set(id, record);
    return record;
  }

  async getAllPartnerships(): Promise<CollegePartnershipRecord[]> {
    return Array.from(this.partnerships.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const collegeStore = new CollegeStore();

// ==========================================
// SCHEMAS & ACTIONS
// ==========================================

const collegePartnershipSchema = z.object({
  institutionName: z.string().min(3, "Institution name must be at least 3 characters.").max(150),
  affiliationType: z.string().min(2, "Please specify institution type / affiliation."),
  tpoHeadName: z.string().min(2, "Placement Head Name is required.").max(100),
  officialEmail: z.string().email("Please provide a valid official institution email.").refine((val) => {
    return val.includes(".edu") || val.includes(".ac.in") || val.includes(".org") || val.includes("@");
  }, { message: "Please use your institutional / official college email address." }),
  phoneNumber: z.string().min(8, "Valid phone number is required.").max(20),
  state: z.string().min(2, "State is required."),
  city: z.string().min(2, "City is required."),
  estimatedBatchSize: z.number().min(10, "Minimum batch size is 10 students.").max(10000),
  preferredHiringModes: z.array(z.string()).min(1, "Select at least 1 preferred hiring mode."),
  comments: z.string().max(1000).optional(),
});

export async function submitCollegePartnershipAction(
  data: z.infer<typeof collegePartnershipSchema>
): Promise<ActionResult<{ referenceCode: string; institutionName: string }>> {
  try {
    const validated = collegePartnershipSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed.",
      };
    }

    const record = await collegeStore.addPartnership(validated.data);

    revalidatePath("/connect/college");
    revalidatePath("/admin/inquiries");

    return {
      success: true,
      data: {
        referenceCode: record.referenceCode,
        institutionName: record.institutionName,
      },
      message: `Institutional Partnership application submitted! Reference ID: ${record.referenceCode}. Our Campus Alliances team will reach out within 24 business hours.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit institutional inquiry.";
    return { success: false, error: message };
  }
}

const campusDriveRegSchema = z.object({
  driveId: z.string().min(1),
  registrantType: z.enum(["student", "tpo_institution"]),
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Valid email address is required."),
  collegeName: z.string().min(2, "College / University name is required."),
  graduationYear: z.string().min(4, "Graduation year is required."),
  phoneNumber: z.string().optional(),
});

export async function registerForCampusDriveAction(
  data: z.infer<typeof campusDriveRegSchema>
): Promise<ActionResult<{ registrationId: string }>> {
  try {
    const validated = campusDriveRegSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed.",
      };
    }

    const record = await collegeStore.addRegistration(validated.data);

    revalidatePath("/connect/college");

    return {
      success: true,
      data: { registrationId: record.id },
      message: "Registration confirmed! You will receive assessment details and prep kit via email prior to the drive.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to register for campus drive.";
    return { success: false, error: message };
  }
}

export async function getCollegeInquiriesAction(): Promise<CollegePartnershipRecord[]> {
  return collegeStore.getAllPartnerships();
}
