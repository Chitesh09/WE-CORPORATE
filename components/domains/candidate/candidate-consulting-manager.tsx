"use client";

import Link from "next/link";
import { CareerServiceOrderRecord } from "@/lib/db/career-service-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

interface CandidateConsultingManagerProps {
  orders: CareerServiceOrderRecord[];
}

export function CandidateConsultingManager({ orders }: CandidateConsultingManagerProps) {
  const getPaymentStatusBadge = (status: CareerServiceOrderRecord["paymentStatus"]) => {
    switch (status) {
      case "paid":
        return <Badge variant="verified">Payment Verified</Badge>;
      case "payment_pending":
        return <Badge variant="warning">Payment Pending</Badge>;
      case "payment_failed":
        return <Badge variant="error">Payment Failed</Badge>;
      case "refunded":
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFulfillmentStatusBadge = (status: CareerServiceOrderRecord["fulfillmentStatus"]) => {
    switch (status) {
      case "fulfillment_pending":
        return <Badge variant="info">Awaiting Mentor Assignment</Badge>;
      case "assigned":
        return <Badge variant="secondary">Mentor Assigned</Badge>;
      case "confirmed":
        return <Badge variant="verified">Session Confirmed</Badge>;
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Session Completed
          </span>
        );
      case "cancelled":
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (orders.length === 0) {
    return (
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-brand-accent">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-brand-primary">No Advisory Sessions Booked</h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Book personalized 1-on-1 resume reviews, mock interviews, and career advisory sessions with industry experts.
            </p>
          </div>
          <Link href="/career-services">
            <Button size="sm" className="text-xs font-semibold">
              Explore Career Services <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="border border-border-subtle bg-surface-card hover:border-border-strong rounded-xl transition-all shadow-sm"
        >
          <CardContent className="p-6 space-y-5">
            {/* Header: Service Name, Status Badges, Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-brand-primary">{order.serviceName}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="font-mono text-[11px] text-text-muted">Order ID: {order.id}</span>
                  <span>•</span>
                  <span>
                    Booked on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                {getPaymentStatusBadge(order.paymentStatus)}
                {order.paymentStatus === "paid" && getFulfillmentStatusBadge(order.fulfillmentStatus)}
              </div>
            </div>

            {/* Session & Fulfillment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-2">
                <span className="font-bold text-brand-primary uppercase tracking-wider block">
                  Your Availability Preferences
                </span>
                <div className="space-y-1 text-text-secondary">
                  <div>
                    <span className="text-text-muted">Preferred Date:</span> {order.intake.preferredDate} ({order.intake.preferredTimeSlot})
                  </div>
                  <div>
                    <span className="text-text-muted">Alternative Date:</span> {order.intake.alternativeDate}
                  </div>
                  <div>
                    <span className="text-text-muted">Goal:</span> {order.intake.careerGoal}
                  </div>
                  {order.intake.resumeFileName && (
                    <div className="flex items-center gap-1 font-medium text-brand-primary pt-1">
                      <FileCheck className="h-3.5 w-3.5 text-brand-accent" />
                      <span>Attached Resume: {order.intake.resumeFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-2">
                <span className="font-bold text-brand-primary uppercase tracking-wider block">
                  Fulfillment Status & Advisor
                </span>
                {order.assignedConsultantName ? (
                  <div className="space-y-1.5 text-text-secondary">
                    <div className="flex items-center gap-1.5 font-semibold text-brand-primary">
                      <User className="h-3.5 w-3.5 text-brand-accent" />
                      <span>{order.assignedConsultantName}</span>
                    </div>
                    {order.confirmedSessionTime ? (
                      <div className="p-2 rounded bg-surface-card border border-feedback-success-text/30 text-xs text-feedback-success-text font-medium flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Confirmed Slot: {order.confirmedSessionTime}</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-text-muted">
                        Advisor assigned. Admin operations is finalizing the live meeting slot.
                      </p>
                    )}
                    {order.consultantNotes && (
                      <p className="text-[11px] text-text-secondary italic pt-1">
                        Note: &quot;{order.consultantNotes}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Our operations team is currently reviewing your intake and matching you with an advisor with relevant domain expertise.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Summary */}
            <div className="flex items-center justify-between pt-2 text-xs text-text-muted">
              <span>Amount Paid: ₹{order.amountInInr.toLocaleString("en-IN")} INR</span>
              <span className="text-[11px] flex items-center gap-1 text-feedback-success-text">
                <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Verified
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
