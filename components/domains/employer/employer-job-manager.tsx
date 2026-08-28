"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { JobRecord } from "@/lib/db/job-store";
import { submitJobForModerationAction, pauseJobAction, closeJobAction } from "@/lib/actions/job-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Pause,
  XCircle,
  Send,
  Loader2,
  ArrowUpRight,
  MessageSquareWarning,
} from "lucide-react";

interface EmployerJobManagerProps {
  jobs: JobRecord[];
  isCompanyVerified: boolean;
  companyVerificationStatus: string;
}

export function EmployerJobManager({
  jobs: initialJobs,
  isCompanyVerified,
  companyVerificationStatus,
}: EmployerJobManagerProps) {
  const [jobs, setJobs] = useState<JobRecord[]>(initialJobs);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "all") return true;
    if (activeTab === "draft") return job.status === "draft";
    if (activeTab === "pending") return job.status === "pending_moderation";
    if (activeTab === "published") return job.status === "published";
    if (activeTab === "action_needed") return job.status === "rejected" || job.status === "needs_info";
    if (activeTab === "inactive") return job.status === "paused" || job.status === "closed";
    return true;
  });

  const handleSubmitForModeration = (jobId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await submitJobForModerationAction(jobId);
      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setJobs(jobs.map((j) => (j.id === jobId ? result.data : j)));
        setSuccessMessage("Job submitted for Admin Moderation!");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    });
  };

  const handlePause = (jobId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await pauseJobAction(jobId);
      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setJobs(jobs.map((j) => (j.id === jobId ? result.data : j)));
        setSuccessMessage("Job listing paused.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  const handleClose = (jobId: string) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await closeJobAction(jobId);
      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setJobs(jobs.map((j) => (j.id === jobId ? result.data : j)));
        setSuccessMessage("Job listing closed.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  const getStatusBadge = (status: JobRecord["status"]) => {
    switch (status) {
      case "published":
        return <Badge variant="verified">Published</Badge>;
      case "pending_moderation":
        return <Badge variant="warning">Under Moderation</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "needs_info":
        return <Badge variant="warning">Needs Information</Badge>;
      case "rejected":
        return <Badge variant="error">Moderation Rejected</Badge>;
      case "paused":
        return <Badge variant="outline">Paused</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banners */}
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

      {!isCompanyVerified && (
        <div className="p-4 rounded-lg bg-feedback-warning-bg/40 border border-feedback-warning-text/30 text-xs text-feedback-warning-text flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Trust Verification Gate Active</span>
            <p className="text-[11px] leading-relaxed">
              Your company is currently <strong>{companyVerificationStatus}</strong>. You can create and edit Drafts freely, but Admin Trust Approval is required before publishing or moderation submission.
            </p>
            <Link href="/e/verification" className="font-semibold underline block pt-0.5">
              Submit / Check Verification Status &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-border-subtle text-xs">
        {[
          { id: "all", label: `All (${jobs.length})` },
          { id: "published", label: `Published (${jobs.filter((j) => j.status === "published").length})` },
          { id: "pending", label: `Pending Review (${jobs.filter((j) => j.status === "pending_moderation").length})` },
          { id: "draft", label: `Drafts (${jobs.filter((j) => j.status === "draft").length})` },
          { id: "action_needed", label: `Feedback / Rejected (${jobs.filter((j) => j.status === "rejected" || j.status === "needs_info").length})` },
          { id: "inactive", label: `Paused / Closed (${jobs.filter((j) => j.status === "paused" || j.status === "closed").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-brand-primary text-white"
                : "bg-surface-subtle text-text-secondary hover:bg-surface-card hover:text-brand-primary border border-border-subtle"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Stream */}
      {filteredJobs.length === 0 ? (
        <Card className="border border-border-subtle bg-surface-card rounded-lg">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-brand-accent">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-primary">No Opportunities in this Tab</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Create full-time or internship postings to discover talented applicants.
              </p>
            </div>
            <Link href="/e/jobs/new">
              <Button size="sm" className="text-xs font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Post an Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className="border border-border-subtle bg-surface-card hover:border-border-strong rounded-lg transition-all shadow-sm"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-brand-primary">{job.title}</span>
                      {job.status === "published" && (
                        <Link
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          className="text-xs text-brand-accent hover:underline inline-flex items-center"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="capitalize">{job.jobType.replace("_", " ")}</span>
                      <span>•</span>
                      <span>{job.city}, {job.state} ({job.workplaceType})</span>
                      <span>•</span>
                      <span className="font-semibold text-brand-primary">
                        ₹{(job.minCompensation / 100000).toFixed(1)} - ₹{(job.maxCompensation / 100000).toFixed(1)} LPA
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {getStatusBadge(job.status)}
                  </div>
                </div>

                {/* Moderation Feedback Alert Box (if rejected or needs_info) */}
                {(job.status === "rejected" || job.status === "needs_info") && job.moderationFeedback && (
                  <div className="p-3 rounded-md bg-feedback-error-bg/20 border border-feedback-error-text/30 text-xs text-feedback-error-text space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <MessageSquareWarning className="h-4 w-4 shrink-0" />
                      <span>Admin Moderation Feedback</span>
                    </div>
                    <p className="text-[11px] leading-relaxed pl-5 font-mono">
                      &quot;{job.moderationFeedback}&quot;
                    </p>
                  </div>
                )}

                {/* Footer / Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <span className="text-[11px] text-text-muted">
                    Last updated on{" "}
                    {new Date(job.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* View Applicants ATS Pipeline */}
                    <Link href={`/e/jobs/${job.id}/applicants`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 px-2.5 font-semibold text-brand-primary"
                      >
                        <Users className="h-3 w-3 mr-1 text-brand-accent" /> Applicants
                      </Button>
                    </Link>

                    {/* Draft or Action Needed: Submit for Moderation */}
                    {(job.status === "draft" || job.status === "needs_info" || job.status === "rejected") && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSubmitForModeration(job.id)}
                        disabled={isPending || !isCompanyVerified}
                        className="text-xs h-8 px-3 font-semibold flex items-center gap-1"
                      >
                        {isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        <span>Submit for Moderation</span>
                      </Button>
                    )}

                    {/* Published Actions: Pause & Close */}
                    {job.status === "published" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePause(job.id)}
                          disabled={isPending}
                          className="text-xs h-8 px-2.5 text-text-secondary"
                        >
                          <Pause className="h-3 w-3 mr-1" /> Pause
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleClose(job.id)}
                          disabled={isPending}
                          className="text-xs h-8 px-2.5 text-feedback-error-text hover:bg-feedback-error-bg/20"
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Close
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
