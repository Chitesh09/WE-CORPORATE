"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CareerServiceRecord } from "@/lib/db/career-service-store";
import { CandidateResumeRecord } from "@/lib/db/candidate-store";
import {
  createCareerServiceOrderAction,
  verifyPaymentAction,
} from "@/lib/actions/career-service-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
  CreditCard,
} from "lucide-react";

interface ServiceBookingFormProps {
  service: CareerServiceRecord;
  resumes: CandidateResumeRecord[];
  isCandidateSignedIn: boolean;
}

export function ServiceBookingForm({
  service,
  resumes,
  isCandidateSignedIn,
}: ServiceBookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
  );
  const [alternativeDate, setAlternativeDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0]
  );
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<
    "morning" | "afternoon" | "evening" | "weekend"
  >("evening");
  const [careerGoal, setCareerGoal] = useState("");
  const [specificQuestions, setSpecificQuestions] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes.find((r) => r.isPrimary)?.id || (resumes[0]?.id ?? "")
  );

  // Simulated Payment Modal State
  const [checkoutPayload, setCheckoutPayload] = useState<{
    orderId: string;
    providerOrderId: string;
    amountInPaise: number;
  } | null>(null);

  const handleInitiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCandidateSignedIn) {
      router.push(`/auth/login?callbackUrl=/career-services/book/${service.slug}`);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);

    startTransition(async () => {
      const result = await createCareerServiceOrderAction({
        serviceSlug: service.slug,
        preferredDate,
        alternativeDate,
        preferredTimeSlot,
        timeZone: "Asia/Kolkata (IST)",
        careerGoal,
        specificQuestions: specificQuestions.trim() || undefined,
        targetRole: targetRole.trim() || undefined,
        resumeId: selectedResumeId || undefined,
        resumeFileName: selectedResume?.fileName,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      // Order created successfully. Display Razorpay checkout modal / simulation
      setCheckoutPayload({
        orderId: result.data.order.id,
        providerOrderId: result.data.providerOrderId,
        amountInPaise: result.data.amountInPaise,
      });
    });
  };

  const handleSimulatePaymentSuccess = () => {
    if (!checkoutPayload) return;
    setErrorMessage(null);

    startTransition(async () => {
      // In dev / verification, simulate valid payment completion
      const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const mockSignature = `sig_mock_${Date.now()}`;

      const verificationResult = await verifyPaymentAction({
        orderId: checkoutPayload.orderId,
        paymentId: mockPaymentId,
        signature: mockSignature,
      });

      if (!verificationResult.success) {
        setErrorMessage(verificationResult.error);
      } else {
        setSuccessMessage("Payment verified successfully! Redirecting to your consulting dashboard...");
        setTimeout(() => router.push("/c/consulting"), 1200);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href="/career-services"
        className="text-xs text-text-muted hover:text-brand-primary flex items-center gap-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Career Services Catalog
      </Link>

      {/* Error & Success Messages */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-md bg-feedback-error-bg text-feedback-error-text text-xs flex items-center gap-2 border border-feedback-error-text/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-md bg-feedback-success-bg text-feedback-success-text text-xs flex items-center gap-2 border border-feedback-success-text/20">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Structured Intake Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border-subtle bg-surface-card rounded-xl shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-border-subtle space-y-1">
                <h2 className="text-lg font-bold text-brand-primary">
                  1. Availability & Career Goals Intake
                </h2>
                <p className="text-xs text-text-secondary">
                  Provide your availability preferences and context so we can match you with the right corporate advisor.
                </p>
              </div>

              <form onSubmit={handleInitiateBooking} className="space-y-5 text-xs">
                {/* Dates Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="prefDate" className="font-semibold text-text-secondary">
                      Preferred Session Date <span className="text-feedback-error-text">*</span>
                    </label>
                    <Input
                      id="prefDate"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="altDate" className="font-semibold text-text-secondary">
                      Alternative Session Date <span className="text-feedback-error-text">*</span>
                    </label>
                    <Input
                      id="altDate"
                      type="date"
                      value={alternativeDate}
                      onChange={(e) => setAlternativeDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">
                    Preferred Time Window (Asia/Kolkata IST) <span className="text-feedback-error-text">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "morning", label: "Morning (9am - 12pm)" },
                      { id: "afternoon", label: "Afternoon (12pm - 4pm)" },
                      { id: "evening", label: "Evening (4pm - 8pm)" },
                      { id: "weekend", label: "Weekend Slot" },
                    ].map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreferredTimeSlot(slot.id as typeof preferredTimeSlot)}
                        className={`p-2.5 rounded-lg border text-center font-semibold text-xs transition-colors ${
                          preferredTimeSlot === slot.id
                            ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                            : "border-border-strong bg-surface-card hover:bg-surface-subtle text-text-secondary"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Role & Career Goal */}
                <div className="space-y-1.5">
                  <label htmlFor="targetRole" className="font-semibold text-text-secondary">
                    Target Role / Domain <span className="text-text-muted font-normal">(Optional)</span>
                  </label>
                  <Input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. SDE-1 (Frontend), Cloud Backend Engineer, Product Analyst"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="goal" className="font-semibold text-text-secondary">
                    Primary Goal for this Advisory Session <span className="text-feedback-error-text">*</span>
                  </label>
                  <textarea
                    id="goal"
                    rows={3}
                    required
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="Describe what you want to achieve (e.g. prepare for product company interviews, fix ATS formatting, review GitHub repos)..."
                    className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus leading-relaxed"
                  />
                </div>

                {/* Specific Questions */}
                <div className="space-y-1.5">
                  <label htmlFor="questions" className="font-semibold text-text-secondary">
                    Specific Questions for the Mentor <span className="text-text-muted font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="questions"
                    rows={2}
                    value={specificQuestions}
                    onChange={(e) => setSpecificQuestions(e.target.value)}
                    placeholder="Any specific architectural topics, compensation questions, or company questions you'd like answered..."
                    className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus leading-relaxed"
                  />
                </div>

                {/* Resume Vault Selection */}
                {resumes.length > 0 && (
                  <div className="space-y-1.5">
                    <label htmlFor="resume" className="font-semibold text-text-secondary">
                      Attach Resume from Vault <span className="text-text-muted font-normal">(Optional)</span>
                    </label>
                    <select
                      id="resume"
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full rounded-md border border-border-strong bg-surface-card p-2.5 text-xs text-brand-primary focus:ring-2 focus:ring-border-focus"
                    >
                      <option value="">Do not attach resume</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.fileName} {r.isPrimary ? "(Primary)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t border-border-subtle">
                  <Button
                    type="submit"
                    disabled={isPending || careerGoal.trim().length < 10}
                    className="w-full text-xs font-bold h-11 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Initializing Secure Order...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Continue to Payment (₹{service.priceInr.toLocaleString("en-IN")})</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Service Summary & Price Breakdown */}
        <div className="space-y-6">
          <Card className="border border-border-subtle bg-surface-card rounded-xl shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2 pb-4 border-b border-border-subtle">
                <Badge variant="secondary" className="text-[10px]">
                  Order Summary
                </Badge>
                <h3 className="text-base font-bold text-brand-primary">{service.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="h-3.5 w-3.5 text-brand-accent" />
                  <span>~{service.durationMinutes} Minutes Live Consultation</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Advisory Fee</span>
                  <span>₹{service.priceInr.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>GST & Service Taxes</span>
                  <span className="text-feedback-success-text">Included</span>
                </div>
                <div className="flex items-center justify-between font-bold text-sm text-brand-primary pt-2 border-t border-border-subtle">
                  <span>Total Payable Amount</span>
                  <span className="text-base font-extrabold text-brand-accent">
                    ₹{service.priceInr.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle text-[11px] text-text-muted space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-brand-primary">
                  <Lock className="h-3.5 w-3.5 text-brand-accent" />
                  <span>Razorpay Verified Payment Gateway</span>
                </div>
                <p className="leading-relaxed">
                  Payments are processed with 256-bit SSL encryption. Once verified, our operations team assigns your mentor and confirms the meeting link.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Razorpay Checkout Modal Simulation */}
      {checkoutPayload && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-xl bg-surface-card shadow-2xl border border-border-strong p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-xs">
                  RZP
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-primary">Razorpay Secure Checkout</h3>
                  <p className="text-[10px] text-text-muted">WE CORPORATE Advisory Services</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                INR {service.priceInr}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-surface-subtle border border-border-subtle space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Service:</span>
                <span className="font-semibold text-brand-primary text-right">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Order ID:</span>
                <span className="font-mono text-[10px] text-text-muted">{checkoutPayload.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Amount:</span>
                <span className="font-bold text-brand-primary">₹{service.priceInr.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                disabled={isPending}
                className="w-full text-xs font-bold h-10 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Signature & Recording Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Pay ₹{service.priceInr} (Simulate Verified Success)</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setCheckoutPayload(null)}
                disabled={isPending}
                className="w-full text-xs h-9"
              >
                Cancel Transaction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
