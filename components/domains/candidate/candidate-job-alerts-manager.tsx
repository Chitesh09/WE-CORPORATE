"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  createJobAlertAction,
  toggleJobAlertAction,
  deleteJobAlertAction,
} from "@/lib/actions/alert-actions";
import { CandidateJobAlertRecord } from "@/lib/db/candidate-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Search,
  Power,
  Clock,
  MapPin,
} from "lucide-react";

interface CandidateJobAlertsManagerProps {
  alerts: CandidateJobAlertRecord[];
}

export function CandidateJobAlertsManager({ alerts }: CandidateJobAlertsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Create Form State
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("Bengaluru");
  const [minCompensationLpa, setMinCompensationLpa] = useState<number>(10);
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const result = await createJobAlertAction({
        title,
        keywords,
        location: location.trim() || undefined,
        minCompensationLpa: Number(minCompensationLpa) || undefined,
        frequency,
      });

      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({ type: "success", message: result.message || "Job alert created successfully." });
        setShowCreateModal(false);
        setTitle("");
        setKeywords("");
      }
    });
  };

  const handleApplyTemplate = (tTitle: string, tKeywords: string, tLoc: string, tMin: number) => {
    setTitle(tTitle);
    setKeywords(tKeywords);
    setLocation(tLoc);
    setMinCompensationLpa(tMin);
    setShowCreateModal(true);
  };

  const handleToggle = (alertId: string) => {
    setStatusMessage(null);
    startTransition(async () => {
      const result = await toggleJobAlertAction(alertId);
      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({ type: "success", message: result.message || "Alert updated." });
      }
    });
  };

  const handleDelete = (alertId: string, alertTitle: string) => {
    if (!confirm(`Are you sure you want to delete the alert "${alertTitle}"?`)) {
      return;
    }
    setStatusMessage(null);
    startTransition(async () => {
      const result = await deleteJobAlertAction(alertId);
      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({ type: "success", message: "Job alert deleted." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-md text-xs flex items-center gap-2 border ${
            statusMessage.type === "success"
              ? "bg-feedback-success-bg text-feedback-success-text border-feedback-success-text/20"
              : "bg-feedback-error-bg text-feedback-error-text border-feedback-error-text/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.message}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-surface-card border border-border-subtle shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-brand-primary">
              Automated Job Alerts & Email Digest
            </h2>
            <Badge variant="verified" className="text-[10px]">
              Active ({alerts.filter((a) => a.isActive).length})
            </Badge>
          </div>
          <p className="text-xs text-text-secondary">
            Never miss an opening. Get instant or daily notifications when verified opportunities matching your skills and salary expectations are published.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="text-xs h-10 px-5 font-bold flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Job Alert</span>
        </Button>
      </div>

      {/* Existing Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card className="border border-dashed border-border-strong bg-surface-card rounded-xl">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-brand-accent">
                <BellRing className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-brand-primary">No Job Alerts Configured</h3>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  Set up your first alert to receive automated updates for roles matching your preferred skills, location, and minimum CTC.
                </p>
              </div>

              {/* 1-Click Popular Templates */}
              <div className="pt-4 border-t border-border-subtle space-y-2">
                <span className="text-[11px] font-semibold text-text-muted flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Or pick a 1-Click Popular Alert:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("Frontend React Roles", "React, TypeScript, Next.js", "Bengaluru", 10)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border-strong bg-surface-subtle hover:border-brand-accent transition-colors text-brand-primary font-medium"
                  >
                    + Frontend React in Bengaluru (?10+ LPA)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("Full-Stack Remote", "Node.js, PostgreSQL, Next.js", "Remote", 12)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border-strong bg-surface-subtle hover:border-brand-accent transition-colors text-brand-primary font-medium"
                  >
                    + Full-Stack Remote (?12+ LPA)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate("UI/UX Product Design", "Figma, Design Systems", "Bengaluru", 8)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border-strong bg-surface-subtle hover:border-brand-accent transition-colors text-brand-primary font-medium"
                  >
                    + UI/UX Design (?8+ LPA)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border transition-all rounded-xl overflow-hidden ${
                  alert.isActive
                    ? "border-border-subtle bg-surface-card hover:border-border-strong shadow-sm"
                    : "border-border-subtle/60 bg-surface-subtle/50 opacity-75"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-primary">{alert.title}</span>
                        <Badge
                          variant={alert.isActive ? "verified" : "secondary"}
                          className="text-[9px] py-0"
                        >
                          {alert.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-brand-accent" />
                          {alert.location || "Any Location"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-brand-accent" />
                          {alert.frequency === "instant"
                            ? "Instant Alerts"
                            : alert.frequency === "daily"
                            ? "Daily Digest"
                            : "Weekly Roundup"}
                        </span>
                        {alert.minCompensationLpa && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">
                              = ?{alert.minCompensationLpa} LPA
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Toggle Switch Button */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(alert.id)}
                      title={alert.isActive ? "Pause Alert" : "Resume Alert"}
                      className={`p-2 rounded-lg border transition-colors ${
                        alert.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-surface-subtle text-text-muted border-border-subtle hover:bg-surface-card"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Keywords Tag Matrix */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
                      Target Keywords & Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {alert.keywords.split(",").map((k) => (
                        <Badge
                          key={k.trim()}
                          variant="secondary"
                          className="text-[11px] py-0.5 px-2 bg-surface-subtle border border-border-subtle text-text-secondary"
                        >
                          {k.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                    <Link
                      href={`/jobs?keyword=${encodeURIComponent(alert.keywords.split(",")[0].trim())}${
                        alert.location ? `&location=${encodeURIComponent(alert.location)}` : ""
                      }`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7 px-2.5 font-semibold border-brand-accent/40 text-brand-primary gap-1"
                      >
                        <Search className="h-3 w-3 text-brand-accent" />
                        <span>Search Live Jobs</span>
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleDelete(alert.id, alert.title)}
                      className="text-[11px] h-7 px-2 text-text-muted hover:text-feedback-error-text hover:bg-feedback-error-bg/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-xl bg-surface-card shadow-2xl border border-border-strong overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-subtle/50">
              <div className="space-y-0.5">
                <Badge variant="verified" className="text-[10px] gap-1">
                  <Bell className="h-3 w-3 text-amber-500" /> Smart Job Alert
                </Badge>
                <h3 className="text-base font-bold text-brand-primary">Configure Automated Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-text-muted hover:text-brand-primary p-1 rounded-md"
              >
                ?
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="alertTitle" className="font-bold text-brand-primary">
                  Alert Title <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="alertTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend / React Roles"
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="alertKeywords" className="font-bold text-brand-primary">
                  Keywords / Skills (Comma-separated) <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="alertKeywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. React, Next.js, TypeScript, Tailwind"
                  required
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="alertLocation" className="font-bold text-brand-primary">
                    Target Location
                  </label>
                  <select
                    id="alertLocation"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-9 rounded-md border border-border-strong bg-surface-card px-2.5 text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                  >
                    <option value="">Any Location / All India</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="alertMinCtc" className="font-bold text-brand-primary">
                    Min Base CTC (? LPA)
                  </label>
                  <Input
                    id="alertMinCtc"
                    type="number"
                    min={0}
                    max={200}
                    value={minCompensationLpa}
                    onChange={(e) => setMinCompensationLpa(Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-primary block">
                  Notification Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "instant", label: "Instant ?" },
                    { id: "daily", label: "Daily Digest" },
                    { id: "weekly", label: "Weekly" },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setFrequency(freq.id as "instant" | "daily" | "weekly")}
                      className={`py-2 rounded-md border text-center text-xs font-semibold transition-colors ${
                        frequency === freq.id
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-surface-card border-border-subtle text-text-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !title.trim() || !keywords.trim()}
                  className="text-xs h-9 px-5 font-bold shadow-sm"
                >
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Alert"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
