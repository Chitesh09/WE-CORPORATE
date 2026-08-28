"use client";

import { useState, useTransition } from "react";
import { JobRecord, JobModerationAuditRecord } from "@/lib/db/job-store";
import {
  adminApproveJobAction,
  adminRejectJobAction,
  adminRequestInfoAction,
} from "@/lib/actions/job-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  History,
  Check,
} from "lucide-react";

interface AdminModerationQueueProps {
  pendingJobs: JobRecord[];
  auditLogs: JobModerationAuditRecord[];
}

export function AdminModerationQueue({
  pendingJobs: initialJobs,
  auditLogs,
}: AdminModerationQueueProps) {
  const [pendingJobs, setPendingJobs] = useState<JobRecord[]>(initialJobs);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Moderation Dialog State
  const [actionJobId, setActionJobId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"REJECT" | "REQUEST_INFO" | null>(null);
  const [moderationNote, setModerationNote] = useState("");

  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleExpand = (jobId: string) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId));
  };

  const handleApprove = (jobId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await adminApproveJobAction(jobId);
      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setPendingJobs(pendingJobs.filter((j) => j.id !== jobId));
        setSuccessMessage(`Job "${result.data.title}" successfully approved and published!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    });
  };

  const handleOpenActionModal = (jobId: string, type: "REJECT" | "REQUEST_INFO") => {
    setActionJobId(jobId);
    setActionType(type);
    setModerationNote("");
    setErrorMessage(null);
  };

  const handleSubmitActionWithNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionJobId || !actionType) return;

    if (!moderationNote.trim() || moderationNote.trim().length < 5) {
      setErrorMessage("Please enter a moderation note of at least 5 characters.");
      return;
    }

    startTransition(async () => {
      let result;
      if (actionType === "REJECT") {
        result = await adminRejectJobAction(actionJobId, moderationNote);
      } else {
        result = await adminRequestInfoAction(actionJobId, moderationNote);
      }

      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setPendingJobs(pendingJobs.filter((j) => j.id !== actionJobId));
        setSuccessMessage(
          actionType === "REJECT"
            ? "Job rejected and feedback recorded."
            : "Information request dispatched to employer."
        );
        setActionJobId(null);
        setActionType(null);
        setTimeout(() => setSuccessMessage(null), 4000);
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

      {/* Main Moderation Queue Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-base font-bold text-brand-primary">
            Pending Listings ({pendingJobs.length})
          </h2>
          <span className="text-xs text-text-muted">
            {pendingJobs.length === 0 ? "Queue is empty" : "Requires moderation decision"}
          </span>
        </div>

        {pendingJobs.length === 0 ? (
          <Card className="border border-border-subtle bg-surface-card rounded-lg">
            <CardContent className="p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-feedback-success-text">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-brand-primary">All Job Postings Moderated</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                There are no pending employer job submissions awaiting review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingJobs.map((job) => {
              const isExpanded = expandedJobId === job.id;

              return (
                <Card
                  key={job.id}
                  className="border border-border-strong bg-surface-card rounded-lg shadow-sm overflow-hidden"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header: Title, Company, Date, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-brand-primary">{job.title}</h3>
                          <Badge variant="warning" className="text-[10px]">
                            <Clock className="h-3 w-3 mr-0.5" /> Pending Review
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                          <span className="font-semibold text-brand-primary">{job.company.name}</span>
                          <span>•</span>
                          <span>{job.city}, {job.state} ({job.workplaceType})</span>
                          <span>•</span>
                          <span className="font-semibold text-brand-accent">
                            ₹{(job.minCompensation / 100000).toFixed(1)} - ₹{(job.maxCompensation / 100000).toFixed(1)} LPA
                          </span>
                        </div>
                      </div>

                      {/* Moderation Action Buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleApprove(job.id)}
                          disabled={isPending}
                          className="text-xs h-8 px-3 font-bold bg-feedback-success-text hover:bg-feedback-success-text/90 text-white flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve & Publish</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenActionModal(job.id, "REQUEST_INFO")}
                          disabled={isPending}
                          className="text-xs h-8 px-2.5 text-text-secondary"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Needs Info
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenActionModal(job.id, "REJECT")}
                          disabled={isPending}
                          className="text-xs h-8 px-2.5 text-feedback-error-text hover:bg-feedback-error-bg/20"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(job.id)}
                          className="text-xs h-8 px-2 text-text-muted hover:text-brand-primary"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Job Full Details Accordion */}
                    {isExpanded && (
                      <div className="pt-2 space-y-4 text-xs animate-in slide-in-from-top-1 duration-standard">
                        <div>
                          <span className="font-bold text-brand-primary uppercase tracking-wider block mb-1">
                            Role Description
                          </span>
                          <p className="p-3 rounded-md bg-surface-subtle border border-border-subtle text-text-secondary leading-relaxed whitespace-pre-line">
                            {job.description}
                          </p>
                        </div>

                        {job.responsibilities.length > 0 && (
                          <div>
                            <span className="font-bold text-brand-primary uppercase tracking-wider block mb-1">
                              Responsibilities
                            </span>
                            <ul className="list-disc pl-5 space-y-1 text-text-secondary">
                              {job.responsibilities.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <span className="font-bold text-brand-primary uppercase tracking-wider block mb-1">
                            Attached Skill Tags
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {job.skills.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded bg-surface-subtle font-medium text-brand-primary border border-border-subtle"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-surface-subtle border border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
                          <span>Submitted By: {job.createdById}</span>
                          <span>Target Experience: {job.experienceLevel}</span>
                          <span>Native Apply: {job.acceptsNativeApplications ? "Enabled" : "Disabled"}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Moderation Feedback Dialog Modal */}
      {actionJobId && actionType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-xl bg-surface-card shadow-2xl border border-border-strong p-6 space-y-4">
            <div className="space-y-1 pb-3 border-b border-border-subtle">
              <h3 className="text-base font-bold text-brand-primary">
                {actionType === "REJECT" ? "Reject Opportunity Submission" : "Request Information from Recruiter"}
              </h3>
              <p className="text-xs text-text-secondary">
                {actionType === "REJECT"
                  ? "Provide a clear reason for rejection (e.g. Non-compliant compensation, duplicate, candidate fee detected)."
                  : "Specify the exact revisions or additional context needed from the employer."}
              </p>
            </div>

            <form onSubmit={handleSubmitActionWithNote} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="modNote" className="text-xs font-semibold text-text-secondary">
                  Moderation Note / Feedback <span className="text-feedback-error-text">*</span>
                </label>
                <textarea
                  id="modNote"
                  rows={4}
                  required
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Enter required feedback for employer..."
                  className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setActionJobId(null);
                    setActionType(null);
                  }}
                  className="text-xs h-9 px-4"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isPending || moderationNote.trim().length < 5}
                  className={`text-xs font-semibold h-9 px-5 ${
                    actionType === "REJECT" ? "bg-feedback-error-text hover:bg-feedback-error-text/90 text-white" : ""
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Confirm Decision</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Audit Trail Section */}
      <div className="pt-6 border-t border-border-subtle space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-accent" />
          <h2 className="text-base font-bold text-brand-primary">Moderation Decision Audit Log</h2>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-text-muted italic">No recent moderation audit records found.</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-border-subtle bg-surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-primary">{log.jobTitle}</span>
                    <span className="text-text-muted">({log.companyName})</span>
                    <Badge
                      variant={
                        log.action === "APPROVE"
                          ? "verified"
                          : log.action === "REJECT"
                          ? "error"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {log.action}
                    </Badge>
                  </div>
                  {log.moderationNote && (
                    <p className="text-[11px] text-text-secondary font-mono pt-0.5">
                      Note: &quot;{log.moderationNote}&quot;
                    </p>
                  )}
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
