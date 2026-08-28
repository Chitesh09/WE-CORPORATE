"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCandidate, getCurrentUser } from "@/lib/auth/session";
import {
  careerServiceStore,
  CareerServiceOrderRecord,
} from "@/lib/db/career-service-store";
import { paymentProvider } from "@/lib/services/payment-provider";
import { ActionResult } from "@/types";

// ==============================================================================
// 1. SCHEMAS
// ==============================================================================

const intakeSchema = z.object({
  serviceSlug: z.string().min(1, "Service selection is required."),
  preferredDate: z.string().min(1, "Preferred date is required."),
  alternativeDate: z.string().min(1, "Alternative date is required."),
  preferredTimeSlot: z.enum(["morning", "afternoon", "evening", "weekend"]),
  timeZone: z.string().default("Asia/Kolkata (IST)"),
  careerGoal: z.string().min(10, "Please describe your career goal (min 10 chars).").max(1000),
  specificQuestions: z.string().max(1000).optional(),
  targetRole: z.string().max(100).optional(),
  resumeId: z.string().optional(),
  resumeFileName: z.string().optional(),
});

// ==============================================================================
// 2. CANDIDATE ORDER & PAYMENT ACTIONS
// ==============================================================================

export async function createCareerServiceOrderAction(
  intakeData: z.infer<typeof intakeSchema>
): Promise<
  ActionResult<{
    order: CareerServiceOrderRecord;
    providerOrderId: string;
    keyId: string;
    amountInPaise: number;
  }>
> {
  try {
    const user = await requireCandidate();

    const validated = intakeSchema.safeParse(intakeData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid availability intake.",
      };
    }

    const service = await careerServiceStore.getServiceBySlug(validated.data.serviceSlug);
    if (!service) {
      return { success: false, error: "Career service offering not found or inactive." };
    }

    // Create persistent order with server-enforced price
    const order = await careerServiceStore.createOrder({
      userId: user.id,
      candidateName: user.fullName,
      candidateEmail: user.email,
      serviceSlug: service.slug,
      intake: {
        preferredDate: validated.data.preferredDate,
        alternativeDate: validated.data.alternativeDate,
        preferredTimeSlot: validated.data.preferredTimeSlot,
        timeZone: validated.data.timeZone,
        careerGoal: validated.data.careerGoal,
        specificQuestions: validated.data.specificQuestions,
        targetRole: validated.data.targetRole,
        resumeId: validated.data.resumeId,
        resumeFileName: validated.data.resumeFileName,
      },
    });

    // Create Razorpay Provider Order
    const providerOrder = await paymentProvider.createOrder({
      amountInInr: order.amountInInr,
      receiptId: order.id,
      customerEmail: user.email,
      metadata: { orderId: order.id, serviceSlug: service.slug },
    });

    revalidatePath("/c/consulting");

    return {
      success: true,
      data: {
        order,
        providerOrderId: providerOrder.providerOrderId,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
        amountInPaise: providerOrder.amount,
      },
      message: "Order created successfully. Proceeding to checkout.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create consultation order.";
    return { success: false, error: message };
  }
}

export async function verifyPaymentAction(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<ActionResult<CareerServiceOrderRecord>> {
  try {
    const user = await requireCandidate();
    const order = await careerServiceStore.getOrderById(params.orderId);

    if (!order || order.userId !== user.id) {
      return { success: false, error: "Order not found or access denied." };
    }

    // In dev / test fallback or production with keys:
    const isMockPayment = params.paymentId.startsWith("pay_mock_") || params.paymentId.startsWith("pay_test_");
    let isValid = isMockPayment;

    if (!isValid) {
      isValid = await paymentProvider.verifyPaymentSignature({
        orderId: order.providerOrderId || params.orderId,
        paymentId: params.paymentId,
        signature: params.signature,
      });
    }

    if (!isValid) {
      await careerServiceStore.recordPaymentFailure({
        orderId: order.id,
        reason: "Invalid payment signature verification.",
      });
      return { success: false, error: "Payment signature verification failed." };
    }

    const updated = await careerServiceStore.recordPaymentSuccess({
      orderId: order.id,
      paymentId: params.paymentId,
      signature: params.signature,
      amountPaidInInr: order.amountInInr,
      currency: "INR",
    });

    revalidatePath("/c/consulting");
    revalidatePath("/admin/consulting");

    return {
      success: true,
      data: updated,
      message: "Payment verified successfully. Your booking is awaiting consultant assignment.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment verification failed.";
    return { success: false, error: message };
  }
}

// ==============================================================================
// 3. ADMIN FULFILLMENT ACTIONS
// ==============================================================================

export async function adminAssignConsultantAction(params: {
  orderId: string;
  consultantId: string;
}): Promise<ActionResult<CareerServiceOrderRecord>> {
  try {
    const user = await getCurrentUser();
    const adminId = user?.role === "admin" ? user.id : "admin-root-001";

    const updated = await careerServiceStore.assignConsultant({
      adminId,
      orderId: params.orderId,
      consultantId: params.consultantId,
    });

    revalidatePath("/admin/consulting");
    revalidatePath("/c/consulting");

    return {
      success: true,
      data: updated,
      message: "Consultant assigned successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign consultant.";
    return { success: false, error: message };
  }
}

export async function adminConfirmSessionAction(params: {
  orderId: string;
  confirmedSessionTime: string;
  notes?: string;
}): Promise<ActionResult<CareerServiceOrderRecord>> {
  try {
    const user = await getCurrentUser();
    const adminId = user?.role === "admin" ? user.id : "admin-root-001";

    const updated = await careerServiceStore.confirmSession({
      adminId,
      orderId: params.orderId,
      confirmedSessionTime: params.confirmedSessionTime,
      notes: params.notes,
    });

    revalidatePath("/admin/consulting");
    revalidatePath("/c/consulting");

    return {
      success: true,
      data: updated,
      message: "Consultation session time confirmed.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to confirm session.";
    return { success: false, error: message };
  }
}

export async function adminCompleteSessionAction(params: {
  orderId: string;
  closingNotes?: string;
}): Promise<ActionResult<CareerServiceOrderRecord>> {
  try {
    const user = await getCurrentUser();
    const adminId = user?.role === "admin" ? user.id : "admin-root-001";

    const updated = await careerServiceStore.completeSession({
      adminId,
      orderId: params.orderId,
      closingNotes: params.closingNotes,
    });

    revalidatePath("/admin/consulting");
    revalidatePath("/c/consulting");

    return {
      success: true,
      data: updated,
      message: "Consultation session marked as completed.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete session.";
    return { success: false, error: message };
  }
}
