"use client";

import { useState, useTransition } from "react";
import { ApplicationRecord } from "@/lib/db/candidate-store";
import { updateApplicationStageAction } from "@/lib/actions/ats-actions";
import { ApplicationStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  User,
  FileText,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface ApplicantDetailDrawerProps {
  application: ApplicationRecord | null;
  jobId: string;
  onClose: () => void;
  onStatusUpdated: (updated: ApplicationRecord) => void;
}

export function ApplicantDetailDrawer({
  application,
  jobId,
  onClose,
  onStatusUpdated,
}: ApplicantDetailDrawerProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stageNote, setStageNote] = useState("");

  if (!application) return null;

  const { profileSnapshot, resumeSnapshot, consent, statusHistory } = application;

  const handleUpdateStage = (newStage: ApplicationStatus) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateApplicationStageAction({
        jobId,
        applicationId: application.id,
        newStage,
        note: stageNote.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setStageNote("");
        onStatusUpdated(result.data);
      }
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return <Badge variant="secondary">Applied</Badge>;
      case "under_review":
        return <Badge variant="warning">Under Review</Badge>;
      case "shortlisted":
        return <Badge variant="verified">Shortlisted</Badge>;
      case "hired":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Hired
          </span>
        );
      case "not_selected":
        return <Badge variant="error">Not Selected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-brand-primary/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-2xl bg-surface-card h-full shadow-2xl border-l border-border-strong flex flex-col overflow-hidden animate-in slide-in-from-right duration-standard">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-card shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-brand-primary">{profileSnapshot.fullName}</h2>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-xs text-text-secondary">
              Applied on{" "}
              {new Date(application.submittedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-text-muted hover:text-brand-primary hover:bg-surface-subtle transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 mx-6 mt-4 rounded-md bg-feedback-error-bg text-feedback-error-text text-xs flex items-center gap-2 border border-feedback-error-text/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Candidate Profile Snapshot */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
              <User className="h-3.5 w-3.5 text-brand-accent" />
              <span>Candidate Profile Snapshot</span>
            </div>

            <div className="p-4 rounded-lg bg-surface-subtle border border-border-subtle space-y-3">
              <div>
                <span className="font-semibold text-brand-primary text-sm">
                  {profileSnapshot.fullName}
                </span>
                {profileSnapshot.headline && (
                  <p className="text-text-secondary text-xs mt-0.5">{profileSnapshot.headline}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-text-muted block">Location:</span>
                  <span className="font-medium text-brand-primary">
                    {profileSnapshot.city || "Not specified"}, {profileSnapshot.state || ""}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Experience:</span>
                  <span className="font-medium text-brand-primary capitalize">
                    {profileSnapshot.experienceLevel || "Freshers"}
                  </span>
                </div>
              </div>

              {profileSnapshot.skills && profileSnapshot.skills.length > 0 && (
                <div>
                  <span className="text-text-muted block mb-1">Attached Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {profileSnapshot.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-surface-card text-[11px] font-medium text-brand-primary border border-border-subtle"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profileSnapshot.bio && (
                <div>
                  <span className="text-text-muted block mb-1">Candidate Bio:</span>
                  <p className="text-text-secondary leading-relaxed bg-surface-card p-2.5 rounded border border-border-subtle">
                    {profileSnapshot.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submitted Resume Snapshot */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5 text-brand-accent" />
              <span>Submitted Resume Snapshot (Immutable)</span>
            </div>

            <div className="p-4 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-brand-primary block">{resumeSnapshot.fileName}</span>
                <span className="text-[11px] text-text-muted">
                  {(resumeSnapshot.fileSizeBytes / 1024).toFixed(0)} KB • PDF Document
                </span>
                <div className="flex items-center gap-1 text-[10px] text-feedback-success-text font-medium pt-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified snapshot captured at application time</span>
                </div>
              </div>

              <div className="p-2 rounded bg-surface-card border border-border-subtle text-text-secondary text-[11px] font-mono">
                [Controlled Preview]
              </div>
            </div>
          </div>

          {/* Cover Note */}
          {application.coverNote && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5 text-brand-accent" />
                <span>Cover Note</span>
              </div>
              <p className="p-4 rounded-lg bg-surface-subtle border border-border-subtle text-text-secondary leading-relaxed whitespace-pre-line">
                &quot;{application.coverNote}&quot;
              </p>
            </div>
          )}

          {/* Consent Information */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle text-[11px] text-text-muted flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-accent shrink-0" />
            <span>
              Direct consent granted by candidate on{" "}
              {new Date(consent.consentTimestamp).toLocaleDateString("en-IN")} for data review by{" "}
              {consent.employerName}.
            </span>
          </div>

          {/* Status History Timeline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 text-brand-accent" />
              <span>Application Stage Timeline</span>
            </div>

            <div className="space-y-2 border-l-2 border-border-subtle pl-4 ml-1">
              {statusHistory.map((entry, idx) => (
                <div key={idx} className="space-y-0.5 text-xs relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-accent border-2 border-surface-card" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-primary capitalize">
                      {entry.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(entry.changedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {entry.note && <p className="text-[11px] text-text-secondary">{entry.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-6 border-t border-border-subtle bg-surface-card shrink-0 space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-secondary">
              Recruiter Action / Stage Transition
            </span>

            {/* If terminal stage */}
            {application.status === "hired" || application.status === "not_selected" ? (
              <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-text-muted text-center">
                This application has reached a terminal decision (
                <strong className="capitalize">{application.status.replace("_", " ")}</strong>).
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {application.status === "applied" && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleUpdateStage("under_review")}
                      disabled={isPending}
                      className="text-xs h-9 px-4 font-bold"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Move to Under Review
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStage("not_selected")}
                      disabled={isPending}
                      className="text-xs h-9 px-3 text-feedback-error-text hover:bg-feedback-error-bg/20"
                    >
                      Mark Not Selected
                    </Button>
                  </>
                )}

                {application.status === "under_review" && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleUpdateStage("shortlisted")}
                      disabled={isPending}
                      className="text-xs h-9 px-4 font-bold bg-feedback-success-text hover:bg-feedback-success-text/90 text-white"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Shortlist Candidate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStage("not_selected")}
                      disabled={isPending}
                      className="text-xs h-9 px-3 text-feedback-error-text hover:bg-feedback-error-bg/20"
                    >
                      Mark Not Selected
                    </Button>
                  </>
                )}

                {application.status === "shortlisted" && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleUpdateStage("hired")}
                      disabled={isPending}
                      className="text-xs h-9 px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Mark as Hired
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStage("not_selected")}
                      disabled={isPending}
                      className="text-xs h-9 px-3 text-feedback-error-text hover:bg-feedback-error-bg/20"
                    >
                      Mark Not Selected
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
