import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DEVELOPMENT_JOBS } from "@/lib/db/seed-data";
import { JobCard } from "@/components/domains/jobs/job-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Building2, MapPin, Globe, ArrowLeft } from "lucide-react";

interface CompanyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const companyJob = DEVELOPMENT_JOBS.find((j) => j.company.slug === slug);

  if (!companyJob) {
    return { title: "Company Profile Not Found" };
  }

  return {
    title: `${companyJob.company.name} — Verified Employer Profile`,
    description: `Explore open jobs and careers at ${companyJob.company.name} in ${companyJob.company.headquartersCity}.`,
  };
}

export default async function CompanyProfilePage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const companyJobs = DEVELOPMENT_JOBS.filter(
    (j) => j.company.slug === slug && j.status === "published"
  );

  if (companyJobs.length === 0) {
    notFound();
  }

  const company = companyJobs[0].company;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Job Discovery
      </Link>

      {/* Company Header Card */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-primary text-white font-bold text-xl shadow-sm">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-brand-primary">{company.name}</h1>
                  {company.isVerified && (
                    <Badge variant="verified">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Corporate Entity
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-1">{company.industry}</p>
              </div>
            </div>

            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                  <Globe className="h-3.5 w-3.5 mr-1.5" /> Visit Official Website
                </Button>
              </a>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">About Company</h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
              {company.about}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-text-muted pt-4 border-t border-border-subtle">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-brand-accent" /> {company.companySize}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-accent" /> Headquarters: {company.headquartersCity}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-accent" /> Verified Domain: {company.corporateDomain}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Listings at this Company */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-brand-primary">
          Open Opportunities at {company.name} ({companyJobs.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
