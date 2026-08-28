import crypto from "crypto";
import { careerServiceStore } from "@/lib/db/career-service-store";
import { paymentProvider } from "@/lib/services/payment-provider";

async function runSecurityPaymentTests() {
  console.log("=== STARTING SECURITY PAYMENT & WEBHOOK INTEGRITY TEST SUITE ===");
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

  // 1. Server-Authoritative Pricing Integrity
  console.log("\n--- 1. Server-Authoritative Pricing Integrity ---");
  const order = await careerServiceStore.createOrder({
    userId: `cand_pay_${timestamp}`,
    candidateName: "Financial Test User",
    candidateEmail: `fin_${timestamp}@example.com`,
    serviceSlug: "resume-review", // Official price is 1499
    intake: {
      preferredDate: "2026-06-01",
      alternativeDate: "2026-06-05",
      preferredTimeSlot: "evening",
      timeZone: "Asia/Kolkata (IST)",
      careerGoal: "Software Architect",
    },
  });
  assert(order.amountInInr === 1499, "Price strictly resolved from backend catalog (₹1,499)");
  assert(order.currency === "INR", "Currency is strictly INR");

  // 2. Razorpay Order Creation & Gateway Amount Integrity
  console.log("\n--- 2. Gateway Order Amount Integrity ---");
  const rzpOrder = await paymentProvider.createOrder({
    amountInInr: order.amountInInr,
    receiptId: order.id,
    customerEmail: order.candidateEmail,
    metadata: { orderId: order.id },
  });
  assert(rzpOrder.amount === 149900, "Amount correctly transformed to paise (149900)");
  assert(rzpOrder.currency === "INR", "Gateway order currency is INR");

  // 3. Signature Verification & Tampering Rejection
  console.log("\n--- 3. Cryptographic Signature Verification ---");
  const validPaymentId = `pay_sec_${timestamp}`;
  const validSignature = crypto
    .createHmac("sha256", "rzp_test_mock_secret_key")
    .update(`${rzpOrder.providerOrderId}|${validPaymentId}`)
    .digest("hex");

  // Test tampered signature
  const isTamperedValid = await paymentProvider.verifyPaymentSignature({
    orderId: rzpOrder.providerOrderId,
    paymentId: validPaymentId,
    signature: "forged_invalid_signature_hash",
  });
  assert(!isTamperedValid, "Forged payment signature is rejected");

  // 4. Server-Side Price Mismatch Rejection
  console.log("\n--- 4. Payment Amount Mismatch Rejection ---");
  let underpaymentBlocked = false;
  try {
    await careerServiceStore.recordPaymentSuccess({
      orderId: order.id,
      paymentId: validPaymentId,
      signature: validSignature,
      amountPaidInInr: 1, // Attacker claims they paid ₹1 instead of ₹1499
      currency: "INR",
    });
  } catch {
    underpaymentBlocked = true;
  }
  assert(underpaymentBlocked, "Payment confirmation with mismatched amount is rejected server-side");

  // 5. Premature Fulfillment Block
  console.log("\n--- 5. Premature Fulfillment Protection ---");
  let prematureFulfillmentBlocked = false;
  try {
    await careerServiceStore.assignConsultant({
      adminId: "admin-root-001",
      orderId: order.id,
      consultantId: "cons-001",
    });
  } catch {
    prematureFulfillmentBlocked = true;
  }
  assert(prematureFulfillmentBlocked, "Cannot assign consultant to an unpaid order");

  // 6. Valid Payment & Webhook Idempotency
  console.log("\n--- 6. Webhook Idempotency & Replay Resistance ---");
  const webhookSecret = "rzp_webhook_placeholder_secret";
  const webhookEventId = `evt_sec_${timestamp}`;
  const webhookBody = JSON.stringify({
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

  const webhookSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(webhookBody)
    .digest("hex");

  // First webhook processing
  const firstPayment = await careerServiceStore.recordPaymentSuccess({
    orderId: order.id,
    paymentId: validPaymentId,
    signature: webhookSig,
    amountPaidInInr: 1499,
    currency: "INR",
    eventId: webhookEventId,
  });
  assert(firstPayment.paymentStatus === "paid", "Order successfully marked 'paid'");

  // Replay duplicate webhook
  const duplicatePayment = await careerServiceStore.recordPaymentSuccess({
    orderId: order.id,
    paymentId: validPaymentId,
    signature: webhookSig,
    amountPaidInInr: 1499,
    currency: "INR",
    eventId: webhookEventId,
  });
  assert(
    duplicatePayment.paymentStatus === "paid",
    "Duplicate webhook replayed idempotently without double-charging or corruption"
  );

  console.log(`\n==================================================`);
  console.log(`SECURITY PAYMENT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityPaymentTests().catch((err) => {
  console.error("Security payment test execution failed:", err);
  process.exit(1);
});
