"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RotateCcw } from "lucide-react";

interface JobFilterDrawerProps {
  activeCount: number;
  metadata?: {
    cities: string[];
    skills: string[];
  };
}

export function JobFilterDrawer({ activeCount, metadata }: JobFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "all";
  const currentWorkplace = searchParams.get("workplace") || "all";
  const currentLocation = searchParams.get("location") || "all";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    router.push(pathname);
    setIsOpen(false);
  };

  // Close on Escape key press
  useState(() => {
    if (typeof window !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  });

  return (
    <div className="lg:hidden">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="filter-drawer-panel"
        className="w-full flex items-center justify-center gap-2 h-10 border-border-strong font-medium"
      >
        <Filter className="h-4 w-4 text-brand-accent" aria-hidden="true" />
        <span>Filters & Categories</span>
        {activeCount > 0 && (
          <Badge variant="verified" className="ml-1 h-5 px-1.5 text-[10px]">
            {activeCount}
          </Badge>
        )}
      </Button>

      {/* Backdrop & Bottom Sheet */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter Opportunities"
          id="filter-drawer-panel"
          className="fixed inset-0 z-50 flex flex-col justify-end bg-brand-primary/50 backdrop-blur-sm animate-in fade-in duration-standard"
        >
          {/* Drawer Panel */}
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl bg-surface-card p-6 shadow-xl border-t border-border-strong space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2 font-bold text-base text-brand-primary">
                <Filter className="h-4 w-4 text-brand-accent" aria-hidden="true" />
                <span>Filter Opportunities</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset all filters"
                  className="text-xs font-semibold text-text-muted hover:text-brand-primary flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-border-focus rounded"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close filter drawer"
                  className="p-1 rounded-md text-text-muted hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-brand-primary uppercase">Category</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "all", label: "All" },
                  { id: "full_time", label: "Full-Time" },
                  { id: "internship", label: "Internships" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateFilter("type", opt.id)}
                    className={`py-2 px-3 rounded-md border text-center font-medium ${
                      currentType === opt.id
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-surface-subtle text-text-secondary border-border-subtle"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Workplace Type */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-brand-primary uppercase">Workplace Mode</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "all", label: "All Modes" },
                  { id: "remote", label: "Remote" },
                  { id: "hybrid", label: "Hybrid" },
                  { id: "on_site", label: "On-site" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateFilter("workplace", opt.id)}
                    className={`py-2 px-3 rounded-md border text-center font-medium ${
                      currentWorkplace === opt.id
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-surface-subtle text-text-secondary border-border-subtle"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cities */}
            {metadata?.cities && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-brand-primary uppercase">Top Cities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {metadata.cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() =>
                        updateFilter("location", currentLocation.toLowerCase() === city.toLowerCase() ? "all" : city)
                      }
                      className={`text-xs px-2.5 py-1 rounded-sm border ${
                        currentLocation.toLowerCase() === city.toLowerCase()
                          ? "bg-brand-primary text-white border-brand-primary font-semibold"
                          : "bg-surface-subtle text-text-secondary border-border-subtle"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Apply & Close */}
            <div className="pt-4 border-t border-border-subtle">
              <Button type="button" onClick={() => setIsOpen(false)} className="w-full h-11 text-sm font-semibold">
                Show Opportunities
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
