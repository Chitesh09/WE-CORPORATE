"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, RotateCcw } from "lucide-react";

interface JobFilterSidebarProps {
  metadata?: {
    fullTimeCount: number;
    internshipCount: number;
    remoteCount: number;
    hybridCount: number;
    onSiteCount: number;
    cities: string[];
    skills: string[];
  };
}

export function JobFilterSidebar({ metadata }: JobFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current active filters from URL
  const currentType = searchParams.get("type") || "all";
  const currentWorkplace = searchParams.get("workplace") || "all";
  const currentExp = searchParams.get("exp") || "all";
  const currentLocation = searchParams.get("location") || "all";
  const currentSkill = searchParams.get("skill") || "all";
  const currentMinComp = searchParams.get("minComp") || "0";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "0" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1"); // Reset pagination
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetAll = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    currentType !== "all" ||
    currentWorkplace !== "all" ||
    currentExp !== "all" ||
    (currentLocation !== "all" && currentLocation !== "") ||
    currentSkill !== "all" ||
    currentMinComp !== "0";

  return (
    <aside className="w-full space-y-6">
      <Card className="border border-border-subtle shadow-sm bg-surface-card rounded-lg">
        <CardContent className="p-5 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2 font-bold text-sm text-brand-primary">
              <Filter className="h-4 w-4 text-brand-accent" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-xs font-semibold text-brand-accent hover:text-brand-accent-hover flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          {/* 1. Opportunity Category */}
          <fieldset className="space-y-2.5">
            <legend className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              Category
            </legend>
            <div className="space-y-1.5 text-xs text-text-secondary">
              {[
                { id: "all", label: "All Opportunities" },
                { id: "full_time", label: "Full-Time Jobs" },
                { id: "internship", label: "Student Internships" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="filter_jobType"
                      checked={currentType === opt.id}
                      onChange={() => updateFilter("type", opt.id)}
                      className="text-brand-accent focus:ring-brand-accent h-3.5 w-3.5"
                    />
                    <span className={currentType === opt.id ? "font-semibold text-brand-primary" : ""}>
                      {opt.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 2. Workplace Mode */}
          <fieldset className="space-y-2.5 pt-4 border-t border-border-subtle">
            <legend className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              Workplace Type
            </legend>
            <div className="space-y-1.5 text-xs text-text-secondary">
              {[
                { id: "all", label: "All Work Modes" },
                { id: "remote", label: "100% Remote" },
                { id: "hybrid", label: "Hybrid" },
                { id: "on_site", label: "On-site" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="filter_workplace"
                      checked={currentWorkplace === opt.id}
                      onChange={() => updateFilter("workplace", opt.id)}
                      className="text-brand-accent focus:ring-brand-accent h-3.5 w-3.5"
                    />
                    <span className={currentWorkplace === opt.id ? "font-semibold text-brand-primary" : ""}>
                      {opt.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 3. Experience Level */}
          <fieldset className="space-y-2.5 pt-4 border-t border-border-subtle">
            <legend className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              Experience Level
            </legend>
            <div className="space-y-1.5 text-xs text-text-secondary">
              {[
                { id: "all", label: "All Experience" },
                { id: "freshers", label: "Freshers (0-1 yr)" },
                { id: "1-3_years", label: "1-3 Years" },
                { id: "3-5_years", label: "3-5 Years" },
                { id: "5+_years", label: "5+ Years" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="filter_exp"
                      checked={currentExp === opt.id}
                      onChange={() => updateFilter("exp", opt.id)}
                      className="text-brand-accent focus:ring-brand-accent h-3.5 w-3.5"
                    />
                    <span className={currentExp === opt.id ? "font-semibold text-brand-primary" : ""}>
                      {opt.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 4. Top Hub Cities */}
          {metadata?.cities && (
            <div className="space-y-2.5 pt-4 border-t border-border-subtle">
              <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                Top Locations
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {metadata.cities.map((city) => {
                  const isSelected = currentLocation.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => updateFilter("location", isSelected ? "all" : city)}
                      className={`text-xs px-2.5 py-1 rounded-sm border transition-colors ${
                        isSelected
                          ? "bg-brand-primary text-white border-brand-primary font-semibold"
                          : "bg-surface-subtle text-text-secondary border-border-subtle hover:border-border-strong"
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Popular Skills Tags */}
          {metadata?.skills && (
            <div className="space-y-2.5 pt-4 border-t border-border-subtle">
              <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                Key Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {metadata.skills.map((skill) => {
                  const isSelected = currentSkill.toLowerCase() === skill.toLowerCase();
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => updateFilter("skill", isSelected ? "all" : skill)}
                      className={`text-[11px] px-2 py-0.5 rounded-sm border transition-colors ${
                        isSelected
                          ? "bg-brand-accent text-white border-brand-accent font-semibold"
                          : "bg-surface-subtle text-text-secondary border-border-subtle hover:border-border-strong"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
