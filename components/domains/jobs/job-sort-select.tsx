"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export function JobSortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary">
      <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
      <label htmlFor="job-sort-select" className="hidden sm:inline font-medium">Sort:</label>
      <select
        id="job-sort-select"
        aria-label="Sort opportunities by"
        value={currentSort}
        onChange={handleSortChange}
        className="rounded-md border border-border-strong bg-surface-card px-2.5 py-1.5 text-xs font-semibold text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
      >
        <option value="newest">Most Recent</option>
        <option value="compensation_desc">Highest Compensation</option>
      </select>
    </div>
  );
}
