import { Suspense } from "react";
import { Metadata } from "next";
import { getPublicJobs, getDiscoveryMetadata } from "@/lib/services/job-service";
import { JobCard } from "@/components/domains/jobs/job-card";
import { JobSearchBar } from "@/components/domains/jobs/job-search-bar";
import { JobFilterSidebar } from "@/components/domains/jobs/job-filter-sidebar";
import { JobFilterDrawer } from "@/components/domains/jobs/job-filter-drawer";
import { JobSortSelect } from "@/components/domains/jobs/job-sort-select";
import { JobPagination } from "@/components/domains/jobs/job-pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Verified Jobs & Careers",
  description:
    "Discover verified full-time, part-time, and remote jobs across India with transparent compensation.",
};

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    type?: "all" | "full_time" | "internship" | "part_time" | "contract";
    workplace?: "all" | "on_site" | "hybrid" | "remote";
    exp?: "all" | "freshers" | "1-3_years" | "3-5_years" | "5+_years";
    skill?: string;
    sort?: "newest" | "compensation_desc" | "relevance";
    page?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : 1;

  const result = await getPublicJobs({
    query: params.q,
    location: params.location,
    jobType: params.type,
    workplaceType: params.workplace,
    experienceLevel: params.exp,
    skill: params.skill,
    sortBy: params.sort,
    page: isNaN(page) ? 1 : page,
    limit: 6,
  });

  const metadata = await getDiscoveryMetadata();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Search Header Banner */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
            Explore Opportunities in India
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Browse verified listings from vetted corporate employers and high-growth technology companies.
          </p>
        </div>

        {/* Search Bar */}
        <Suspense fallback={<div className="h-14 w-full bg-surface-card rounded-lg border border-border-subtle animate-pulse" />}>
          <JobSearchBar />
        </Suspense>
      </div>

      {/* Main Listing Layout: 1/4 Sidebar + 3/4 Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <Suspense fallback={<div className="h-96 w-full bg-surface-card rounded-lg border border-border-subtle animate-pulse" />}>
            <JobFilterSidebar metadata={metadata} />
          </Suspense>
        </div>

        {/* Feed Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Mobile Filter Drawer + Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-text-secondary">
                Showing <strong className="text-brand-primary">{result.jobs.length}</strong> of{" "}
                <strong className="text-brand-primary">{result.totalCount}</strong> opportunities
              </span>
              <div className="sm:hidden">
                <Suspense fallback={<div className="h-8 w-24 bg-surface-card rounded animate-pulse" />}>
                  <JobSortSelect />
                </Suspense>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-full sm:w-auto">
                <Suspense fallback={<div className="h-10 w-full bg-surface-card rounded animate-pulse" />}>
                  <JobFilterDrawer activeCount={result.activeFiltersCount} metadata={metadata} />
                </Suspense>
              </div>
              <div className="hidden sm:block">
                <Suspense fallback={<div className="h-8 w-28 bg-surface-card rounded animate-pulse" />}>
                  <JobSortSelect />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Job Results Feed or Empty State */}
          {result.jobs.length > 0 ? (
            <div className="space-y-3.5">
              {result.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}

              {/* Numbered Pagination */}
              <Suspense fallback={<div className="h-10 w-full bg-surface-card rounded animate-pulse" />}>
                <JobPagination
                  currentPage={result.currentPage}
                  totalPages={result.totalPages}
                  hasNextPage={result.hasNextPage}
                  hasPrevPage={result.hasPrevPage}
                />
              </Suspense>
            </div>
          ) : (
            /* Empty State */
            <Card className="border-dashed border-border-strong bg-surface-card text-center py-12 px-4 rounded-lg">
              <CardContent className="space-y-4 max-w-md mx-auto">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
                  <SearchX className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-brand-primary">No matching opportunities found</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Try broadening your search query, removing specific skill tags, or resetting your location filters.
                  </p>
                </div>
                <Link href="/jobs">
                  <Button variant="outline" size="sm" className="text-xs font-semibold">
                    Reset All Filters
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
