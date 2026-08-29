"use client";

import { useState } from "react";
import { CAMPUS_DRIVES, CampusDrive } from "@/lib/data/campus-drives";
import { CampusDriveRegistrationModal } from "@/components/domains/college/campus-drive-registration-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  GraduationCap,
  Users,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

export function CampusDrivesSchedule() {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegisterDrive, setActiveRegisterDrive] = useState<CampusDrive | null>(null);
  const [expandedDriveId, setExpandedDriveId] = useState<string | null>(null);

  const filteredDrives = CAMPUS_DRIVES.filter((drive) => {
    const matchSearch =
      drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.hiringRoles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchBatch =
      selectedBatch === "all" || drive.targetBatch.includes(selectedBatch);

    return matchSearch && matchBatch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-card border border-border-subtle shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drives by role, company, or tech stack..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-strong bg-surface-subtle text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
          {[
            { id: "all", label: "All Drives" },
            { id: "2026", label: "2026 Batch" },
            { id: "2025", label: "2025 Batch" },
          ].map((batch) => (
            <button
              key={batch.id}
              type="button"
              onClick={() => setSelectedBatch(batch.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedBatch === batch.id
                  ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                  : "bg-surface-card text-text-secondary border-border-subtle hover:bg-surface-subtle"
              }`}
            >
              {batch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drives Grid */}
      <div className="space-y-4">
        {filteredDrives.length === 0 ? (
          <div className="p-8 text-center bg-surface-card border border-dashed border-border-strong rounded-xl text-xs text-text-muted">
            No campus drives matching your filters.
          </div>
        ) : (
          filteredDrives.map((drive) => {
            const isExpanded = expandedDriveId === drive.id;

            return (
              <Card
                key={drive.id}
                className="border border-border-subtle bg-surface-card rounded-xl shadow-xs hover:border-border-strong transition-all overflow-hidden"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Row: Title, Company, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={drive.status === "closing_soon" ? "warning" : "verified"}
                          className="text-[10px] py-0.5"
                        >
                          {drive.status === "closing_soon" ? "Closing Soon ??" : "Active Registration"}
                        </Badge>
                        <span className="text-xs text-text-muted font-medium">
                          {drive.targetBatch}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-brand-primary">
                        {drive.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1 font-semibold text-brand-primary">
                          <Building2 className="h-3.5 w-3.5 text-brand-accent" />
                          {drive.companyName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-text-muted" />
                          Deadline: {new Date(drive.registrationDeadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* CTC Tag & Register Button */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-text-muted block">CTC Package</span>
                        <span className="text-base font-extrabold text-emerald-700">
                          {drive.compensationRange}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setActiveRegisterDrive(drive)}
                        className="text-xs h-9 px-4 font-bold shadow-sm flex items-center gap-1"
                      >
                        <span>Register Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Badges / Hiring Roles & Degree Eligibility */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border-subtle text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        Open Roles ({drive.openingsCount} Vacancies)
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {drive.hiringRoles.map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="text-[11px] py-0.5 px-2 bg-surface-subtle border border-border-subtle font-medium text-brand-primary"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        Eligible Disciplines
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {drive.eligibleDegrees.map((deg) => (
                          <span
                            key={deg}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-surface-subtle text-text-secondary border border-border-subtle"
                          >
                            {deg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-surface-subtle border border-border-subtle text-[11px] text-text-secondary">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-brand-accent" />
                        <strong>Format:</strong> {drive.driveFormat}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-brand-accent" />
                        <strong>Colleges:</strong> {drive.participatingCollegesCount}+ Partner Institutes
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedDriveId(isExpanded ? null : drive.id)}
                      className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? "Hide Selection Process" : "View Selection Rounds"}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expandable Rounds & Criteria */}
                  {isExpanded && (
                    <div className="p-4 rounded-lg bg-brand-accent/5 border border-brand-accent/30 space-y-3 text-xs animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <span className="font-bold text-brand-primary">Eligibility & Minimum Criteria:</span>
                        <p className="text-text-secondary">{drive.minCgpaCriteria}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="font-bold text-brand-primary">Multi-Stage Evaluation Process:</span>
                        <div className="space-y-1.5 pl-2">
                          {drive.selectionProcess.map((round, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-text-secondary">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                                {idx + 1}
                              </span>
                              <span>{round}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Registration Modal Trigger */}
      {activeRegisterDrive && (
        <CampusDriveRegistrationModal
          drive={activeRegisterDrive}
          onClose={() => setActiveRegisterDrive(null)}
        />
      )}
    </div>
  );
}
