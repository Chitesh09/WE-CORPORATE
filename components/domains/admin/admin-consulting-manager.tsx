"use client";

import { useState, useTransition } from "react";
import {
  CareerServiceOrderRecord,
  ConsultantRecord,
  CareerServiceAuditRecord,
} from "@/lib/db/career-service-store";
import {
  adminAssignConsultantAction,
  adminConfirmSessionAction,
  adminCompleteSessionAction,
} from "@/lib/actions/career-service-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  History,
  FileCheck,
  Check,
} from "lucide-react";

interface AdminConsultingManagerProps {
  orders: CareerServiceOrderRecord[];
  consultants: ConsultantRecord[];
  auditLogs: CareerServiceAuditRecord[];
}

export function AdminConsultingManager({
  orders: initialOrders,
  consultants,
  auditLogs,
}: AdminConsultingManagerProps) {
  const [orders, setOrders] = useState<CareerServiceOrderRecord[]>(initialOrders);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected Consultant Map for Inline Assignment
  const [selectedConsultantMap, setSelectedConsultantMap] = useState<Record<string, string>>({});

  // Confirm Session Modal State
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [confirmedTimeInput, setConfirmedTimeInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending_assignment") return order.fulfillmentStatus === "fulfillment_pending" && order.paymentStatus === "paid";
    if (activeFilter === "assigned") return order.fulfillmentStatus === "assigned";
    if (activeFilter === "confirmed") return order.fulfillmentStatus === "confirmed";
    if (activeFilter === "completed") return order.fulfillmentStatus === "completed";
    return true;
  });

  const handleAssignConsultant = (orderId: string) => {
    const consultantId = selectedConsultantMap[orderId];
    if (!consultantId) {
      setErrorMessage("Please select a consultant from the dropdown.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await adminAssignConsultantAction({
        orderId,
        consultantId,
      });

      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? result.data : o)));
        setSuccessMessage("Consultant successfully assigned to order.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  const handleConfirmSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingOrderId || !confirmedTimeInput.trim()) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await adminConfirmSessionAction({
        orderId: confirmingOrderId,
        confirmedSessionTime: confirmedTimeInput.trim(),
        notes: notesInput.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === confirmingOrderId ? result.data : o)));
        setSuccessMessage("Consultation session confirmed and scheduled.");
        setConfirmingOrderId(null);
        setConfirmedTimeInput("");
        setNotesInput("");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  const handleCompleteSession = (orderId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await adminCompleteSessionAction({ orderId });
      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? result.data : o)));
        setSuccessMessage("Session marked as completed.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Alert Banners */}
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: "all", label: `All Bookings (${orders.length})` },
          {
            id: "pending_assignment",
            label: `Awaiting Assignment (${orders.filter((o) => o.fulfillmentStatus === "fulfillment_pending" && o.paymentStatus === "paid").length})`,
          },
          {
            id: "assigned",
            label: `Assigned (${orders.filter((o) => o.fulfillmentStatus === "assigned").length})`,
          },
          {
            id: "confirmed",
            label: `Confirmed (${orders.filter((o) => o.fulfillmentStatus === "confirmed").length})`,
          },
          {
            id: "completed",
            label: `Completed (${orders.filter((o) => o.fulfillmentStatus === "completed").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeFilter === tab.id
                ? "bg-brand-primary text-white"
                : "bg-surface-subtle text-text-secondary hover:bg-surface-card hover:text-brand-primary border border-border-subtle"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="border border-border-subtle bg-surface-card rounded-lg">
          <CardContent className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-feedback-success-text">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-brand-primary">No Orders in this Queue</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              All candidate advisory orders are up to date.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="border border-border-subtle bg-surface-card rounded-xl shadow-sm overflow-hidden"
            >
              <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-brand-primary">{order.serviceName}</h3>
                      <Badge variant="verified">₹{order.amountInInr} (Paid)</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                      <span className="font-semibold text-brand-primary">{order.candidateName}</span>
                      <span>({order.candidateEmail})</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-text-muted">{order.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Badge
                      variant={
                        order.fulfillmentStatus === "completed"
                          ? "verified"
                          : order.fulfillmentStatus === "confirmed"
                          ? "verified"
                          : order.fulfillmentStatus === "assigned"
                          ? "secondary"
                          : "warning"
                      }
                    >
                      {order.fulfillmentStatus.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Intake Context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1.5">
                    <span className="font-bold text-brand-primary uppercase tracking-wider block">
                      Candidate Intake & Preferences
                    </span>
                    <div>
                      <span className="text-text-muted">Target Slot:</span> {order.intake.preferredDate} ({order.intake.preferredTimeSlot})
                    </div>
                    <div>
                      <span className="text-text-muted">Alt Date:</span> {order.intake.alternativeDate}
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

                  {/* Fulfillment Controls */}
                  <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-3">
                    <span className="font-bold text-brand-primary uppercase tracking-wider block">
                      Fulfillment & Operations
                    </span>

                    {/* Step 1: Assign Consultant */}
                    {order.fulfillmentStatus === "fulfillment_pending" && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-text-secondary block">
                          Assign Active Mentor / Advisor:
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={selectedConsultantMap[order.id] || ""}
                            onChange={(e) =>
                              setSelectedConsultantMap({
                                ...selectedConsultantMap,
                                [order.id]: e.target.value,
                              })
                            }
                            className="flex-1 rounded-md border border-border-strong bg-surface-card p-2 text-xs text-brand-primary focus:ring-2 focus:ring-border-focus"
                          >
                            <option value="">Select an Advisor...</option>
                            {consultants.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} — {c.title} ({c.organization})
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAssignConsultant(order.id)}
                            disabled={isPending}
                            className="text-xs h-9 px-3 font-semibold"
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Confirm Session Slot */}
                    {order.fulfillmentStatus === "assigned" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-brand-primary font-semibold">
                          <User className="h-3.5 w-3.5 text-brand-accent" />
                          <span>{order.assignedConsultantName}</span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setConfirmingOrderId(order.id);
                            setConfirmedTimeInput(
                              `${order.intake.preferredDate} at 5:00 PM IST`
                            );
                          }}
                          className="text-xs h-8 px-3 font-semibold"
                        >
                          <Calendar className="h-3.5 w-3.5 mr-1" /> Confirm Session Time
                        </Button>
                      </div>
                    )}

                    {/* Step 3: Confirmed / Complete Session */}
                    {order.fulfillmentStatus === "confirmed" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-feedback-success-text font-medium">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Confirmed: {order.confirmedSessionTime}</span>
                        </div>
                        <p className="text-[11px] text-text-muted">Advisor: {order.assignedConsultantName}</p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleCompleteSession(order.id)}
                          disabled={isPending}
                          className="text-xs h-8 px-3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Mark Completed
                        </Button>
                      </div>
                    )}

                    {order.fulfillmentStatus === "completed" && (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-feedback-success-text flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Session Successfully Delivered
                        </span>
                        <p className="text-[11px] text-text-muted">
                          Delivered by {order.assignedConsultantName} on {order.confirmedSessionTime}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Session Dialog Modal */}
      {confirmingOrderId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-xl bg-surface-card shadow-2xl border border-border-strong p-6 space-y-4">
            <div className="pb-3 border-b border-border-subtle space-y-1">
              <h3 className="font-bold text-base text-brand-primary">Confirm Live Consultation Slot</h3>
              <p className="text-xs text-text-secondary">
                Confirm the finalized meeting slot and notes for the candidate and mentor.
              </p>
            </div>

            <form onSubmit={handleConfirmSession} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="slotTime" className="font-semibold text-text-secondary">
                  Confirmed Date & Time Slot <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="slotTime"
                  value={confirmedTimeInput}
                  onChange={(e) => setConfirmedTimeInput(e.target.value)}
                  placeholder="e.g. Saturday, 15 March 2026 at 5:00 PM IST"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notes" className="font-semibold text-text-secondary">
                  Meeting Notes / Agenda Instructions <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Please bring your GitHub portfolio link and target job descriptions..."
                  className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmingOrderId(null)}
                  className="text-xs h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !confirmedTimeInput.trim()}
                  className="text-xs font-semibold h-9 px-5"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm Slot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="pt-6 border-t border-border-subtle space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-accent" />
          <h2 className="text-base font-bold text-brand-primary">Consulting Fulfillment Audit Trail</h2>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-text-muted italic">No recent consulting audit records recorded.</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-border-subtle bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-primary">{log.action}</span>
                    <span className="text-text-muted">({log.orderId})</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {log.actorRole}
                    </Badge>
                  </div>
                </div>
                <span className="text-[11px] text-text-muted shrink-0">
                  {new Date(log.timestamp).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
