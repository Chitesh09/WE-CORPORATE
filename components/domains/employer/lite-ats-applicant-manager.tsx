"use client";

import { useState } from "react";
import Link from "next/link";
import { ApplicationRecord } from "@/lib/db/candidate-store";
import { ApplicationStatus } from "@/types";
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

export function LiteAtsApplicantManager({
  job,
  initialApplications,
}: LiteAtsApplicantManagerProps) {
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications);
  const [activeStage, setActiveStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);

  // Filter & Search Logic
  const filtered = applications
    .filter((app) => {
      if (activeStage !== "all" && app.status !== activeStage) {
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
      </div>

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

      {/* Search & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name, headline, or skills..."
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
            <option value="newest">Newest Applications First</option>
            <option value="oldest">Oldest Applications First</option>
          </select>
        </div>
      </div>

      {/* Applicant Listings */}
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
                : "No candidates have applied to this opportunity yet. Applications will appear here as soon as candidates submit via the 1-Click Pipeline."}
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
