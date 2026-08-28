import { Suspense } from "react";
import Link from "next/link";
import { getPublicJobs } from "@/lib/services/job-service";
import { JobCard } from "@/components/domains/jobs/job-card";
import { JobSearchBar } from "@/components/domains/jobs/job-search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  // Fetch recent verified jobs for featured section
  const { jobs: featuredJobs } = await getPublicJobs({ limit: 4 });

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-card via-surface-card to-surface-canvas py-16 sm:py-24 border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-card px-3.5 py-1 text-xs font-semibold text-text-secondary shadow-sm">
              <ShieldCheck className="h-4 w-4 text-brand-accent" />
              <span>High-Trust Verified Career Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-primary leading-tight">
              Verified Jobs & Internships for Ambitious Talent in India
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Discover curated opportunities from verified employers. Transparent compensation brackets, zero recruiter spam, and direct 1-click application tracking.
            </p>

            {/* Quick Search Strip */}
            <div className="pt-2 max-w-3xl mx-auto">
              <Suspense fallback={<div className="h-14 w-full bg-surface-card rounded-lg border border-border-subtle animate-pulse" />}>
                <JobSearchBar />
              </Suspense>
            </div>

            {/* Trust Anchors */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
              <div className="flex items-center gap-1.5 font-medium text-text-secondary">
                <CheckCircle2 className="h-4 w-4 text-brand-accent" />
                <span>100% Moderated Listings</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-text-secondary">
                <CheckCircle2 className="h-4 w-4 text-brand-accent" />
                <span>Transparent INR Compensation</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-text-secondary">
                <CheckCircle2 className="h-4 w-4 text-brand-accent" />
                <span>Verified Employer Portals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Opportunity Tracks */}
      <section className="py-12 border-b border-border-subtle bg-surface-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">Explore Career Tracks</h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Targeted pathways for freshers, experienced engineers, and student interns.
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-semibold text-brand-accent hover:text-brand-accent-hover inline-flex items-center gap-1"
            >
              Browse All Opportunities <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/jobs?type=full_time">
              <Card className="hover:border-border-strong hover:shadow-md transition-all h-full cursor-pointer">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-3 rounded-md bg-surface-subtle text-brand-primary shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-primary">Full-Time Engineering</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Frontend, Backend, Full Stack & Cloud Infrastructure roles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/internships">
              <Card className="hover:border-border-strong hover:shadow-md transition-all h-full cursor-pointer">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-3 rounded-md bg-surface-subtle text-brand-primary shrink-0">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-primary">Student Internships</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Summer & winter internships with guaranteed stipends.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/career-services">
              <Card className="hover:border-border-strong hover:shadow-md transition-all h-full cursor-pointer">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-3 rounded-md bg-surface-subtle text-brand-accent shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-primary">Career Guidance</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      1-on-1 resume reviews and interview preparation sessions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/connect/college">
              <Card className="hover:border-border-strong hover:shadow-md transition-all h-full cursor-pointer">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-3 rounded-md bg-surface-subtle text-brand-primary shrink-0">
                    <Building2 className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-brand-primary">Campus Placements</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Institutional drives and university talent partnerships.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Featured Opportunities Feed */}
      <section className="py-12 bg-surface-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">Featured Opportunities</h2>
                <Badge variant="verified" className="text-xs">
                  Recently Verified
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Active listings reviewed by our moderation team.
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                View All {featuredJobs.length}+ Jobs
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="text-center pt-4 sm:hidden">
            <Link href="/jobs">
              <Button variant="outline" className="w-full">
                View All Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Employer Trust Callout */}
      <section className="py-12 border-t border-border-subtle bg-surface-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border-strong bg-brand-primary text-white p-8 sm:p-12">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent">
                <ShieldCheck className="h-4 w-4" />
                <span>For Recruiters & Corporate Hiring Teams</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Hire Verified Talent With Zero Spam Applications
              </h2>
              <p className="text-sm text-surface-subtle/80 leading-relaxed">
                Publish verified job & internship postings, access verified student pipelines, and review structured candidate snapshots with our streamlined Lite ATS.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/auth/employer/signup">
                  <Button variant="accent" size="lg" className="text-sm font-semibold">
                    Register as Employer
                  </Button>
                </Link>
                <Link href="/connect/vendor">
                  <Button variant="secondary" size="lg" className="text-sm font-semibold text-brand-primary bg-white hover:bg-surface-subtle">
                    Vendor Connect
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
