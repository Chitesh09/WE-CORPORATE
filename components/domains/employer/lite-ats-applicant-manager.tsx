"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ApplicationRecord } from "@/lib/db/candidate-store";
import { ApplicationStatus } from "@/types";
import { updateApplicationStageAction, updateApplicationEvaluationAction } from "@/lib/actions/ats-actions";
import { ApplicantDetailDrawer } from "@/components/domains/employer/applicant-detail-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  FileText,
  ArrowLeft,
  ChevronRight,
  Kanban,
  List,
  Star,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface LiteAtsApplicantManagerProps {
  job: {
    id: string;
    title: string;
    slug: string;
    status: string;
    city: string;
    state: string;
    jobType: string;
  };
  initialApplications: ApplicationRecord[];
}

const KANBAN_COLUMNS: Array<{ id: ApplicationStatus; title: string }> = [
  { id: "applied", title: "1. Applied" },
  { id: "under_review", title: "2. Under Review" },
  { id: "shortlisted", title: "3. Shortlisted" },
  { id: "hired", title: "4. Hired" },
  { id: "not_selected", title: "5. Not Selected" },
];

export function LiteAtsApplicantManager({
  job,
  initialApplications,
}: LiteAtsApplicantManagerProps) {
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [activeStage, setActiveStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);
  const [, startTransition] = useTransition();

  // Quick 1-Click Move Stage from Kanban
  const handleQuickMoveStage = (e: React.MouseEvent, appId: string, newStage: ApplicationStatus) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await updateApplicationStageAction({
        jobId: job.id,
        applicationId: appId,
        newStage,
      });
      if (result.success) {
        setApplications((prev) => prev.map((a) => (a.id === appId ? result.data : a)));
      }
    });
  };

  // Quick Star Rating from Kanban Card
  const handleQuickRate = (e: React.MouseEvent, appId: string, rating: number) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await updateApplicationEvaluationAction({
        jobId: job.id,
        applicationId: appId,
        rating,
      });
      if (result.success) {
        setApplications((prev) => prev.map((a) => (a.id === appId ? result.data : a)));
      }
    });
  };

  // Filter & Search Logic
  const filtered = applications
    .filter((app) => {
      if (viewMode === "list" && activeStage !== "all" && app.status !== activeStage) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          app.profileSnapshot.fullName.toLowerCase().includes(q) ||
          (app.profileSnapshot.headline && app.profileSnapshot.headline.toLowerCase().includes(q)) ||
          app.profileSnapshot.skills.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const tA = new Date(a.submittedAt).getTime();
      const tB = new Date(b.submittedAt).getTime();
      return sortBy === "newest" ? tB - tA : tA - tB;
    });

  const handleStatusUpdated = (updated: ApplicationRecord) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedApplication(updated);
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
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
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="pb-4 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/e/jobs"
            className="text-xs text-text-muted hover:text-brand-primary flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Job Listings
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-primary">{job.title}</h1>
            <Badge variant="outline" className="capitalize text-xs">
              {job.jobType.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary">
            {job.city}, {job.state} • Total Applicants:{" "}
            <strong className="text-brand-primary">{applications.length}</strong>
          </p>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg border border-border-subtle self-start sm:self-center">
          <Button
            type="button"
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="text-xs h-7 px-2.5 font-semibold gap-1.5"
          >
            <Kanban className="h-3.5 w-3.5" /> Kanban Board
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="text-xs h-7 px-2.5 font-semibold gap-1.5"
          >
            <List className="h-3.5 w-3.5" /> List View
          </Button>
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter applicants by candidate name, headline, or skills..."
            className="pl-9 text-xs h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary shrink-0">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
            className="rounded-md border border-border-strong bg-surface-card px-3 py-2 text-xs text-brand-primary focus:ring-2 focus:ring-border-focus"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* 1. KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const colApps = filtered.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-surface-subtle/80 rounded-xl p-3 border border-border-subtle flex flex-col min-h-[420px] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-brand-primary">{col.title}</span>
                  </div>
                  <span className="text-[11px] font-bold bg-surface-card px-2 py-0.5 rounded-full border border-border-subtle text-text-secondary">
                    {colApps.length}
                  </span>
                </div>

                {/* Candidate Cards Stream */}
                <div className="space-y-2.5 flex-1">
                  {colApps.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-[11px] italic border border-dashed border-border-subtle rounded-lg">
                      No candidates in this stage.
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <Card
                        key={app.id}
                        onClick={() => setSelectedApplication(app)}
                        className="bg-surface-card hover:border-brand-accent hover:shadow-md cursor-pointer rounded-lg border border-border-subtle transition-all duration-standard"
                      >
                        <CardContent className="p-3.5 space-y-2.5">
                          {/* Header: Name + Avatar */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-brand-primary block truncate">
                                {app.profileSnapshot.fullName}
                              </span>
                              {app.profileSnapshot.headline && (
                                <span className="text-[10px] text-text-muted line-clamp-1">
                                  {app.profileSnapshot.headline}
                                </span>
                              )}
                            </div>
                            <div className="h-6 w-6 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {app.profileSnapshot.fullName.slice(0, 2).toUpperCase()}
                            </div>
                          </div>

                          {/* Star Rating Strip */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={(e) => handleQuickRate(e, app.id, star)}
                                className="p-0.5 hover:scale-110 transition-transform"
                                title={`Rate ${star} star`}
                              >
                                <Star
                                  className={`h-3 w-3 ${
                                    star <= (app.rating || 0)
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-border-strong"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>

                          {/* Screening Answers Pill */}
                          {app.screeningAnswers && app.screeningAnswers.length > 0 && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-50 text-[10px] font-medium text-teal-800 border border-teal-200">
                              <HelpCircle className="h-2.5 w-2.5" />
                              <span>{app.screeningAnswers.length} Screening Q&A</span>
                            </div>
                          )}

                          {/* Resume & Timestamp */}
                          <div className="text-[10px] text-text-muted flex items-center justify-between pt-1 border-t border-border-subtle">
                            <span className="flex items-center gap-1 truncate max-w-[110px]">
                              <FileText className="h-2.5 w-2.5 text-brand-accent shrink-0" />
                              {app.resumeSnapshot.fileName}
                            </span>
                            <span className="shrink-0">
                              {new Date(app.submittedAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>

                          {/* Quick 1-Click Action Buttons */}
                          <div className="flex items-center gap-1 pt-1">
                            {col.id === "applied" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleQuickMoveStage(e, app.id, "under_review")}
                                className="text-[10px] h-6 px-2 w-full font-semibold bg-surface-subtle"
                              >
                                Move to Review <ArrowRight className="h-2.5 w-2.5 ml-1" />
                              </Button>
                            )}
                            {col.id === "under_review" && (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleQuickMoveStage(e, app.id, "shortlisted")}
                                  className="text-[10px] h-6 px-2 flex-1 font-semibold text-emerald-700 bg-emerald-50 border-emerald-200"
                                >
                                  Shortlist
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleQuickMoveStage(e, app.id, "not_selected")}
                                  className="text-[10px] h-6 px-1.5 text-feedback-error-text"
                                >
                                  ✕
                                </Button>
                              </>
                            )}
                            {col.id === "shortlisted" && (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  onClick={(e) => handleQuickMoveStage(e, app.id, "hired")}
                                  className="text-[10px] h-6 px-2 flex-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Hire
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleQuickMoveStage(e, app.id, "not_selected")}
                                  className="text-[10px] h-6 px-1.5 text-feedback-error-text"
                                >
                                  ✕
                                </Button>
                              </>
                            )}
                            {(col.id === "hired" || col.id === "not_selected") && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleQuickMoveStage(e, app.id, "under_review")}
                                className="text-[10px] h-6 px-2 w-full text-text-muted hover:text-brand-primary"
                              >
                                Reopen Review
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {/* Stage Filter Buttons & Counts */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "all", label: `All (${applications.length})` },
              { id: "applied", label: `Applied (${applications.filter((a) => a.status === "applied").length})` },
              {
                id: "under_review",
                label: `Under Review (${applications.filter((a) => a.status === "under_review").length})`,
              },
              {
                id: "shortlisted",
                label: `Shortlisted (${applications.filter((a) => a.status === "shortlisted").length})`,
              },
              {
                id: "hired",
                label: `Hired (${applications.filter((a) => a.status === "hired").length})`,
              },
              {
                id: "not_selected",
                label: `Not Selected (${applications.filter((a) => a.status === "not_selected").length})`,
              },
            ].map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  activeStage === stage.id
                    ? "bg-brand-primary text-white"
                    : "bg-surface-subtle text-text-secondary hover:bg-surface-card hover:text-brand-primary border border-border-subtle"
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card className="border border-border-subtle bg-surface-card rounded-lg">
              <CardContent className="p-12 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-brand-primary">No Applications Found</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {searchQuery || activeStage !== "all"
                    ? "Try clearing your search query or switching stage filters."
                    : "No candidates have applied to this opportunity yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((app) => (
                <Card
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className="border border-border-subtle bg-surface-card hover:border-brand-accent hover:shadow-sm cursor-pointer rounded-lg transition-all"
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-brand-primary">
                          {app.profileSnapshot.fullName}
                        </span>
                        {getStatusBadge(app.status)}
                        {app.rating && app.rating > 0 && (
                          <div className="flex items-center gap-0.5 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span className="text-xs font-bold text-brand-primary">{app.rating}/5</span>
                          </div>
                        )}
                        {app.screeningAnswers && app.screeningAnswers.length > 0 && (
                          <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                            {app.screeningAnswers.length} Screening Q&A
                          </span>
                        )}
                      </div>

                      {app.profileSnapshot.headline && (
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {app.profileSnapshot.headline}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted pt-0.5">
                        <span>
                          {app.profileSnapshot.city || "Pan-India"}
                          {app.profileSnapshot.state ? `, ${app.profileSnapshot.state}` : ""}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-brand-primary">
                          <FileText className="h-3 w-3 text-brand-accent" />
                          {app.resumeSnapshot.fileName}
                        </span>
                        <span>•</span>
                        <span>
                          Applied{" "}
                          {new Date(app.submittedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 px-3 font-semibold group"
                      >
                        <span>Review Application</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide-Over Drawer for Application Review */}
      {selectedApplication && (
        <ApplicantDetailDrawer
          application={selectedApplication}
          jobId={job.id}
          onClose={() => setSelectedApplication(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
