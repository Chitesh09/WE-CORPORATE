"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { collegeStore } from "@/lib/db/college-store";
import { ActionResult } from "@/types";

// ==========================================
// SCHEMAS & SERVER ACTIONS
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

export async function getCollegeInquiriesAction() {
  return collegeStore.getAllPartnerships();
}
