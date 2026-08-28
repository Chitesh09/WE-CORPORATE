import { NextRequest, NextResponse } from "next/server";
import { careerServiceStore } from "@/lib/db/career-service-store";
import { paymentProvider } from "@/lib/services/payment-provider";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_webhook_placeholder_secret";
    const isValid = await paymentProvider.verifyWebhookSignature(rawBody, signature, secret);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id || `evt_${Date.now()}`;
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const orderId = paymentEntity?.notes?.orderId || orderEntity?.receipt;
      const paymentId = paymentEntity?.id || `pay_${Date.now()}`;
      const amountPaidInPaise = paymentEntity?.amount || orderEntity?.amount || 0;
      const amountPaidInInr = Math.round(amountPaidInPaise / 100);
      const currency = paymentEntity?.currency || orderEntity?.currency || "INR";

      if (!orderId) {
        return NextResponse.json(
          { success: false, error: "Order reference not found in payload notes." },
          { status: 400 }
        );
      }

      await careerServiceStore.recordPaymentSuccess({
        orderId,
        paymentId,
        amountPaidInInr,
        currency,
        eventId,
      });
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.orderId;
      const reason = paymentEntity?.error_description || "Payment authorization failed.";

      if (orderId) {
        await careerServiceStore.recordPaymentFailure({
          orderId,
          reason,
          eventId,
        });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing error.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
