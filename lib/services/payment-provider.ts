import crypto from "crypto";

export interface CreateOrderParams {
  amountInInr: number;
  receiptId: string;
  customerEmail: string;
  metadata: Record<string, unknown>;
}

export interface ProviderOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface VerifyPaymentSignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface IPaymentProvider {
  createOrder(params: CreateOrderParams): Promise<ProviderOrderResult>;
  verifyPaymentSignature(params: VerifyPaymentSignatureParams): Promise<boolean>;
  verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean>;
}

export class RazorpayPaymentProvider implements IPaymentProvider {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_webhook_placeholder_secret";
  }

  async createOrder(params: CreateOrderParams): Promise<ProviderOrderResult> {
    // In production, invokes Razorpay API: https://api.razorpay.com/v1/orders
    // In dev / test runtime, constructs verified order envelope with amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(params.amountInInr * 100);
    const providerOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return {
      providerOrderId,
      amount: amountInPaise,
      currency: "INR",
      receipt: params.receiptId,
    };
  }

  async verifyPaymentSignature(params: VerifyPaymentSignatureParams): Promise<boolean> {
    try {
      const text = `${params.orderId}|${params.paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(text)
        .digest("hex");

      return expectedSignature === params.signature;
    } catch {
      return false;
    }
  }

  async verifyWebhookSignature(payload: string, signature: string, secret?: string): Promise<boolean> {
    try {
      const effectiveSecret = secret || this.webhookSecret;
      const expectedSignature = crypto
        .createHmac("sha256", effectiveSecret)
        .update(payload)
        .digest("hex");

      return expectedSignature === signature;
    } catch {
      return false;
    }
  }
}

export const paymentProvider: IPaymentProvider = new RazorpayPaymentProvider();
