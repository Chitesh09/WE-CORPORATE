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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SearchX, GraduationCap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Student Internships with Guaranteed Stipends",
  description:
    "Discover verified summer, winter, and semester internships for undergraduate and postgraduate students in India.",
};

interface InternshipsPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    workplace?: "all" | "on_site" | "hybrid" | "remote";
    exp?: "all" | "freshers" | "1-3_years" | "3-5_years" | "5+_years";
    skill?: string;
    sort?: "newest" | "compensation_desc" | "relevance";
    page?: string;
  }>;
}

export default async function InternshipsPage({ searchParams }: InternshipsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const result = await getPublicJobs({
    query: params.q,
    location: params.location,
    jobType: "internship",
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
      {/* Student Internship Hero Banner */}
      <div className="rounded-xl border border-border-strong bg-gradient-to-r from-surface-card to-surface-subtle p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info" className="text-xs">
            <GraduationCap className="h-3.5 w-3.5 mr-1" /> Student Internships
          </Badge>
          <Badge variant="verified" className="text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Guaranteed Monthly Stipends
          </Badge>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
            Student Internships in India
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Gain verified industry experience with top technology startups and corporate leaders. Zero unpaid listings, transparent monthly stipends, and Pre-Placement Offer (PPO) opportunities.
          </p>
        </div>

        {/* Search Bar */}
        <Suspense fallback={<div className="h-14 w-full bg-surface-card rounded-lg border border-border-subtle animate-pulse" />}>
          <JobSearchBar />
        </Suspense>
      </div>

      {/* Main Listing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <Suspense fallback={<div className="h-96 w-full bg-surface-card rounded-lg border border-border-subtle animate-pulse" />}>
            <JobFilterSidebar metadata={metadata} />
          </Suspense>
        </div>

        {/* Results Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
            <span className="text-xs font-semibold text-text-secondary">
              Showing <strong className="text-brand-primary">{result.jobs.length}</strong> of{" "}
              <strong className="text-brand-primary">{result.totalCount}</strong> verified internships
            </span>

            <div className="flex items-center gap-3">
              <div className="w-full sm:w-auto">
                <Suspense fallback={<div className="h-10 w-full bg-surface-card rounded animate-pulse" />}>
                  <JobFilterDrawer activeCount={result.activeFiltersCount} metadata={metadata} />
                </Suspense>
              </div>
              <Suspense fallback={<div className="h-8 w-28 bg-surface-card rounded animate-pulse" />}>
                <JobSortSelect />
              </Suspense>
            </div>
          </div>

          {result.jobs.length > 0 ? (
            <div className="space-y-3.5">
              {result.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}

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
            <Card className="border-dashed border-border-strong bg-surface-card text-center py-12 px-4 rounded-lg">
              <CardContent className="space-y-4 max-w-md mx-auto">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
                  <SearchX className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-brand-primary">No internships found for these filters</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Try adjusting your location or resetting specific keyword criteria.
                  </p>
                </div>
                <Link href="/internships">
                  <Button variant="outline" size="sm" className="text-xs font-semibold">
                    View All Internships
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
