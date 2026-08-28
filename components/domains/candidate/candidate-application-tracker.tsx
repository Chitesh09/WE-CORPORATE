"use client";

import { useState } from "react";
import Link from "next/link";
import { ApplicationRecord } from "@/lib/db/candidate-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
  ArrowUpRight,
  Info,
  Download,
} from "lucide-react";

interface CandidateApplicationTrackerProps {
  applications: ApplicationRecord[];
}

export function CandidateApplicationTracker({ applications }: CandidateApplicationTrackerProps) {
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const toggleExpand = (appId: string) => {
    setExpandedAppId((prev) => (prev === appId ? null : appId));
  };

  const getStatusBadge = (status: ApplicationRecord["status"]) => {
    switch (status) {
      case "applied":
        return <Badge variant="warning">Applied</Badge>;
      case "under_review":
        return <Badge variant="info">Under Review</Badge>;
      case "shortlisted":
        return <Badge variant="verified">Shortlisted</Badge>;
      case "hired":
        return <Badge variant="verified">Hired</Badge>;
      case "not_selected":
        return <Badge variant="error">Not Selected</Badge>;
      default:
        return <Badge variant="secondary">Applied</Badge>;
    }
  };

  if (applications.length === 0) {
    return (
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-brand-accent">
            <Send className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-brand-primary">No Applications Submitted Yet</h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Your submitted applications and hiring team status updates will appear here in real-time.
            </p>
          </div>
          <Link href="/jobs">
            <Button size="sm" className="text-xs font-semibold">
              <Search className="h-3.5 w-3.5 mr-1.5" /> Explore Verified Jobs
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const isExpanded = expandedAppId === app.id;

        return (
          <Card
            key={app.id}
            className={`border transition-all duration-standard rounded-lg overflow-hidden ${
              isExpanded ? "border-brand-accent/40 shadow-sm" : "border-border-subtle bg-surface-card hover:border-border-strong"
            }`}
          >
            <CardContent className="p-5 space-y-4">
              {/* Header: Title, Employer, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${app.jobSlug}`}
                      className="font-bold text-base text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1"
                    >
                      <span>{app.jobTitle}</span>
                      <ArrowUpRight className="h-4 w-4 text-text-muted shrink-0" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="font-semibold text-brand-primary">{app.companyName}</span>
                    <span>•</span>
                    <span className="text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Applied on{" "}
                      {new Date(app.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                  {getStatusBadge(app.status)}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(app.id)}
                    aria-expanded={isExpanded}
                    className="text-xs h-8 px-2 text-text-muted hover:text-brand-primary flex items-center gap-1"
                  >
                    <span>{isExpanded ? "Hide Details" : "View Snapshot"}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Summary Strip: Attached Resume Snapshot */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-surface-subtle text-brand-accent">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-medium text-brand-primary">{app.resumeSnapshot.fileName}</span>
                    <span className="text-[11px] text-text-muted ml-1.5">
                      ({(app.resumeSnapshot.fileSizeBytes / 1024).toFixed(0)} KB • Immutable Snapshot)
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Controlled Presigned Download for Application Snapshot: ${app.resumeSnapshot.fileName}`)}
                  className="text-xs h-7 px-2.5"
                >
                  <Download className="h-3 w-3 mr-1 text-brand-accent" /> View Submitted Resume
                </Button>
              </div>

              {/* Expandable Application Snapshot Details */}
              {isExpanded && (
                <div className="pt-4 border-t border-border-subtle space-y-4 animate-in slide-in-from-top-1 duration-standard">
                  {/* Cover Note */}
                  {app.coverNote ? (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                        Cover Note to Hiring Team
                      </span>
                      <p className="p-3 rounded-md bg-surface-subtle border border-border-subtle text-xs text-text-secondary whitespace-pre-line leading-relaxed">
                        {app.coverNote}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic">No cover note was included with this application.</p>
                  )}

                  {/* Profile Snapshot Preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                      Submitted Profile Snapshot
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-md bg-surface-subtle border border-border-subtle text-xs">
                      <div>
                        <span className="text-text-muted block">Applicant Name:</span>
                        <span className="font-semibold text-brand-primary">{app.profileSnapshot.fullName}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Email:</span>
                        <span className="font-semibold text-brand-primary">{app.profileSnapshot.email}</span>
                      </div>
                      {app.profileSnapshot.headline && (
                        <div className="sm:col-span-2">
                          <span className="text-text-muted block">Headline:</span>
                          <span className="text-text-secondary">{app.profileSnapshot.headline}</span>
                        </div>
                      )}
                      {app.profileSnapshot.skills && app.profileSnapshot.skills.length > 0 && (
                        <div className="sm:col-span-2">
                          <span className="text-text-muted block mb-1">Skills Snapshot:</span>
                          <div className="flex flex-wrap gap-1">
                            {app.profileSnapshot.skills.map((skill) => (
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
                    </div>
                  </div>

                  {/* Status History & Audit Log */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                      Application Milestone History
                    </span>
                    <div className="space-y-1.5 text-xs text-text-secondary">
                      {app.statusHistory.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded bg-surface-subtle text-[11px]">
                          <ShieldCheck className="h-3.5 w-3.5 text-brand-accent shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold text-brand-primary capitalize">{item.status}</span>
                            <span className="text-text-muted ml-2">
                              {new Date(item.changedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {item.note && <p className="text-text-muted mt-0.5">{item.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legal Consent Audit */}
                  <div className="p-2.5 rounded bg-surface-subtle text-[11px] text-text-muted flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                    <span>
                      Consent verified: Shared with {app.consent.employerName} on{" "}
                      {new Date(app.consent.consentTimestamp).toLocaleString("en-IN")}.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
