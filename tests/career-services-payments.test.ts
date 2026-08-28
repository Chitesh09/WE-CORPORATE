import crypto from "crypto";
import { careerServiceStore } from "@/lib/db/career-service-store";
import { candidateStore } from "@/lib/db/candidate-store";
import { paymentProvider } from "@/lib/services/payment-provider";

async function runCareerServicesPaymentTests() {
  console.log("=== STARTING PHASE 7.4 CAREER SERVICES & PAYMENTS TEST SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
      failed++;
    }
  }

  const timestamp = Date.now();

  // 1. Service Catalog & Server-Side Price Integrity
  console.log("\n--- 1. Service Catalog & Price Integrity ---");
  const activeServices = await careerServiceStore.getActiveServices();
  assert(activeServices.length >= 4, "Active career services retrieved from catalog");

  const resumeService = await careerServiceStore.getServiceBySlug("resume-review");
  assert(resumeService !== null, "Resume review service exists");
  assert(resumeService?.priceInr === 1499, "Server-enforced price for resume review is ₹1,499");

  // 2. Candidate Order Creation
  console.log("\n--- 2. Candidate Order Creation & Intake ---");
  const candidate = await candidateStore.createCandidate({
    email: `candidate.payment.${timestamp}@example.com`,
    password: "Password123!",
    fullName: "Aakash Varma",
  });

  const order = await careerServiceStore.createOrder({
    userId: candidate.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    serviceSlug: "resume-review",
    intake: {
      preferredDate: "2026-04-10",
      alternativeDate: "2026-04-12",
      preferredTimeSlot: "evening",
      timeZone: "Asia/Kolkata (IST)",
      careerGoal: "Prepare for product company frontend engineering roles in Bengaluru.",
    },
  });

  assert(order.id.startsWith("ord_cs_"), "Order created with standard ID prefix");
  assert(order.amountInInr === 1499, "Order amount strictly inherited from database service price");
  assert(order.paymentStatus === "payment_pending", "Initial payment status is 'payment_pending'");
  assert(order.fulfillmentStatus === "fulfillment_pending", "Initial fulfillment status is 'fulfillment_pending'");

  // 3. Provider Order Creation
  console.log("\n--- 3. Payment Provider Order & Signature Verification ---");
  const providerOrder = await paymentProvider.createOrder({
    amountInInr: order.amountInInr,
    receiptId: order.id,
    customerEmail: candidate.email,
    metadata: { orderId: order.id },
  });

  assert(providerOrder.amount === 149900, "Provider order amount converted to paise (1499 * 100 = 149900)");
  assert(providerOrder.currency === "INR", "Currency is INR");

  // 4. Payment Verification Signature Tests
  console.log("\n--- 4. Signature Verification Security ---");
  const keySecret = "rzp_test_placeholder_secret";
  const validPaymentId = `pay_${Date.now()}`;
  const validSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${providerOrder.providerOrderId}|${validPaymentId}`)
    .digest("hex");

  const isSigValid = await paymentProvider.verifyPaymentSignature({
    orderId: providerOrder.providerOrderId,
    paymentId: validPaymentId,
    signature: validSignature,
  });
  assert(isSigValid, "Valid payment signature correctly verified");

  const isInvalidSigBlocked = await paymentProvider.verifyPaymentSignature({
    orderId: providerOrder.providerOrderId,
    paymentId: validPaymentId,
    signature: "invalid_tampered_signature_12345",
  });
  assert(!isInvalidSigBlocked, "Tampered payment signature correctly rejected");

  // 5. Payment Recording & Success Transition
  console.log("\n--- 5. Payment Confirmation & State Transition ---");
  const paidOrder = await careerServiceStore.recordPaymentSuccess({
    orderId: order.id,
    paymentId: validPaymentId,
    signature: validSignature,
    amountPaidInInr: 1499,
    currency: "INR",
  });

  assert(paidOrder.paymentStatus === "paid", "Order paymentStatus transitioned to 'paid'");
  assert(typeof paidOrder.paidAt === "string", "paidAt timestamp recorded");

  // Amount Mismatch Protection
  let mismatchBlocked = false;
  try {
    const order2 = await careerServiceStore.createOrder({
      userId: candidate.id,
      candidateName: candidate.fullName,
      candidateEmail: candidate.email,
      serviceSlug: "mock-interview",
      intake: {
        preferredDate: "2026-04-15",
        alternativeDate: "2026-04-18",
        preferredTimeSlot: "weekend",
        timeZone: "Asia/Kolkata (IST)",
        careerGoal: "Mock interview practice.",
      },
    });

    await careerServiceStore.recordPaymentSuccess({
      orderId: order2.id,
      paymentId: `pay_tamper_${Date.now()}`,
      amountPaidInInr: 500, // Price is 2499, sending 500
      currency: "INR",
    });
  } catch {
    mismatchBlocked = true;
  }
  assert(mismatchBlocked, "Payment amount mismatch rejected server-side");

  // 6. Webhook Signature & Idempotent Webhook Processing
  console.log("\n--- 6. Webhook Security & Idempotency ---");
  const webhookSecret = "rzp_webhook_placeholder_secret";
  const webhookEventId = `evt_${Date.now()}`;
  const webhookPayload = JSON.stringify({
    id: webhookEventId,
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: validPaymentId,
          amount: 149900,
          currency: "INR",
          notes: { orderId: order.id },
        },
      },
    },
  });

  const webhookSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(webhookPayload)
    .digest("hex");

  const isWebhookSigValid = await paymentProvider.verifyWebhookSignature(
    webhookPayload,
    webhookSignature,
    webhookSecret
  );
  assert(isWebhookSigValid, "Webhook HMAC-SHA256 signature verified");

  // Duplicate Webhook Idempotency Check
  const duplicateReplay = await careerServiceStore.recordPaymentSuccess({
    orderId: order.id,
    paymentId: validPaymentId,
    amountPaidInInr: 1499,
    currency: "INR",
    eventId: webhookEventId,
  });
  assert(duplicateReplay.paymentStatus === "paid", "Duplicate webhook replayed idempotently without error");

  // 7. Admin Fulfillment State Machine & Consultant Assignment
  console.log("\n--- 7. Admin Fulfillment State Machine ---");
  const consultants = await careerServiceStore.getActiveConsultants();
  assert(consultants.length >= 3, "Active consultants retrieved");
  const assignedConsultant = consultants[0];

  // Unpaid order cannot be assigned consultant
  const unpaidOrder = await careerServiceStore.createOrder({
    userId: candidate.id,
    candidateName: candidate.fullName,
    candidateEmail: candidate.email,
    serviceSlug: "profile-audit",
    intake: {
      preferredDate: "2026-04-20",
      alternativeDate: "2026-04-22",
      preferredTimeSlot: "morning",
      timeZone: "Asia/Kolkata (IST)",
      careerGoal: "LinkedIn audit",
    },
  });

  let unpaidAssignmentBlocked = false;
  try {
    await careerServiceStore.assignConsultant({
      adminId: "admin-root-001",
      orderId: unpaidOrder.id,
      consultantId: assignedConsultant.id,
    });
  } catch {
    unpaidAssignmentBlocked = true;
  }
  assert(unpaidAssignmentBlocked, "Unpaid order cannot be assigned a consultant");

  // Paid order assignment
  const assignedOrder = await careerServiceStore.assignConsultant({
    adminId: "admin-root-001",
    orderId: order.id,
    consultantId: assignedConsultant.id,
  });
  assert(assignedOrder.fulfillmentStatus === "assigned", "Fulfillment status is 'assigned'");
  assert(
    Boolean(assignedOrder.assignedConsultantName?.includes(assignedConsultant.name)),
    "Consultant name bound to order"
  );

  // Confirm session time
  const confirmedOrder = await careerServiceStore.confirmSession({
    adminId: "admin-root-001",
    orderId: order.id,
    confirmedSessionTime: "Saturday, 12 April 2026 at 6:00 PM IST",
    notes: "Please have your current resume and GitHub repo ready.",
  });
  assert(confirmedOrder.fulfillmentStatus === "confirmed", "Fulfillment status is 'confirmed'");
  assert(
    confirmedOrder.confirmedSessionTime === "Saturday, 12 April 2026 at 6:00 PM IST",
    "Confirmed session time recorded"
  );

  // Complete session
  const completedOrder = await careerServiceStore.completeSession({
    adminId: "admin-root-001",
    orderId: order.id,
    closingNotes: "Resume successfully optimized with ATS metrics and STAR impact statements.",
  });
  assert(completedOrder.fulfillmentStatus === "completed", "Fulfillment status is 'completed'");
  assert(typeof completedOrder.completedAt === "string", "completedAt timestamp recorded");

  // 8. Order Scoping & IDOR Security
  console.log("\n--- 8. Order Ownership & IDOR Security ---");
  const candidateOrders = await careerServiceStore.getOrdersForCandidate(candidate.id);
  assert(candidateOrders.some((o) => o.id === order.id), "Candidate retrieves own orders");

  const candidateBOrders = await careerServiceStore.getOrdersForCandidate("other-candidate-999");
  assert(candidateBOrders.length === 0, "Candidate B cannot see Candidate A's orders");

  // 9. Audit Trail Verification
  console.log("\n--- 9. Audit Trail Verification ---");
  const auditLogs = await careerServiceStore.getAuditLogs(order.id);
  assert(auditLogs.length >= 4, "Complete audit trail recorded for order lifecycle");
  assert(auditLogs.some((l) => l.action === "ORDER_CREATED"), "ORDER_CREATED logged");
  assert(auditLogs.some((l) => l.action === "PAYMENT_VERIFIED"), "PAYMENT_VERIFIED logged");
  assert(auditLogs.some((l) => l.action === "FULFILLMENT_ASSIGNED"), "FULFILLMENT_ASSIGNED logged");
  assert(auditLogs.some((l) => l.action === "SESSION_CONFIRMED"), "SESSION_CONFIRMED logged");
  assert(auditLogs.some((l) => l.action === "SESSION_COMPLETED"), "SESSION_COMPLETED logged");

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runCareerServicesPaymentTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
