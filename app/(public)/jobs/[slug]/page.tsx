import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicJobBySlug, getRelatedJobs } from "@/lib/services/job-service";
import { getCurrentUser } from "@/lib/auth/session";
import { candidateStore, CandidateResumeRecord, CandidateProfileData } from "@/lib/db/candidate-store";
import { JobCard } from "@/components/domains/jobs/job-card";
import { JobShareButton } from "@/components/domains/jobs/job-share-button";
import { JobSaveButton } from "@/components/domains/jobs/job-save-button";
import { ApplyModal } from "@/components/domains/applications/apply-modal";
import { JobJsonLd } from "@/components/domains/jobs/job-jsonld";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import {
  MapPin,
  ShieldCheck,
  Building2,
  Globe,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJobBySlug(slug);

  if (!job) {
    return {
      title: "Opportunity Not Found",
    };
  }

  return {
    title: `${job.title} at ${job.company.name}`,
    description: `${job.title} opportunity in ${job.city}. Verified listing on WE CORPORATE.`,
    openGraph: {
      title: `${job.title} | ${job.company.name}`,
      description: job.description.slice(0, 160),
      url: `/jobs/${job.slug}`,
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getPublicJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isSaved = currentUser ? await candidateStore.isJobSaved(currentUser.id, job.id) : false;
  const alreadyApplied = currentUser ? await candidateStore.hasCandidateApplied(currentUser.id, job.id) : false;

  let candidateProfile: CandidateProfileData | null = null;
  let candidateResumes: CandidateResumeRecord[] = [];

  if (currentUser) {
    const profileRecord = await candidateStore.getProfile(currentUser.id);
    candidateProfile = profileRecord?.profile || null;
    candidateResumes = await candidateStore.getResumes(currentUser.id);
  }

  const relatedJobs = await getRelatedJobs(job.id, 2);
  const isInternship = job.jobType === "internship";

  const compensationDisplay = isInternship
    ? `${formatINR(job.minCompensation)} - ${formatINR(job.maxCompensation)} / month`
    : `${(job.minCompensation / 100000).toFixed(1)} - ${(job.maxCompensation / 100000).toFixed(1)} LPA`;

  const experienceDisplay =
    job.experienceLevel === "freshers"
      ? "Freshers (0-1 yr)"
      : job.experienceLevel === "1-3_years"
      ? "1-3 Years"
      : job.experienceLevel === "3-5_years"
      ? "3-5 Years"
      : "5+ Years";

  const workplaceDisplay =
    job.workplaceType === "remote"
      ? "100% Remote"
      : job.workplaceType === "hybrid"
      ? "Hybrid (Office + Remote)"
      : "On-site";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Schema.org Structured Data */}
      <JobJsonLd job={job} />

      {/* Back Link */}
      <Link
        href={isInternship ? "/internships" : "/jobs"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {isInternship ? "Internships" : "Job Listings"}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Comprehensive Job Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border-subtle shadow-sm bg-surface-card rounded-lg overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Header: Company & Title */}
              <div className="space-y-3 pb-6 border-b border-border-subtle">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isInternship ? "info" : "secondary"}>
                    {isInternship ? "Student Internship" : "Full-Time Position"}
                  </Badge>
                  {job.company.isVerified && (
                    <Badge variant="verified">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Employer
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-primary tracking-tight">
                  {job.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                  <Link
                    href={`/companies/${job.company.slug}`}
                    className="font-semibold text-brand-primary hover:text-brand-accent transition-colors"
                  >
                    {job.company.name}
                  </Link>
                  <span>•</span>
                  <span>{job.city}, {job.state}</span>
                </div>
              </div>

              {/* Core Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-surface-subtle border border-border-subtle text-xs">
                <div>
                  <span className="text-text-muted block font-medium">Work Mode</span>
                  <span className="font-bold text-brand-primary mt-0.5 block">{workplaceDisplay}</span>
                </div>
                <div>
                  <span className="text-text-muted block font-medium">Experience Level</span>
                  <span className="font-bold text-brand-primary mt-0.5 block">{experienceDisplay}</span>
                </div>
                <div>
                  <span className="text-text-muted block font-medium">
                    {isInternship ? "Monthly Stipend" : "Annual CTC"}
                  </span>
                  <span className="font-bold text-brand-primary mt-0.5 block">{compensationDisplay}</span>
                </div>
              </div>

              {/* 1. Role Overview */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-brand-primary">About the Role</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* 2. Key Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h2 className="text-base sm:text-lg font-bold text-brand-primary">Key Responsibilities</h2>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. Requirements & Qualifications */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h2 className="text-base sm:text-lg font-bold text-brand-primary">
                    Candidate Qualifications & Requirements
                  </h2>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0 mt-2" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Perks & Benefits */}
              {job.perks && job.perks.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h2 className="text-base sm:text-lg font-bold text-brand-primary">Perks & Growth Opportunities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {job.perks.map((perk, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2.5 rounded-md bg-surface-subtle text-text-secondary border border-border-subtle"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Required Technical Skills */}
              <div className="space-y-3 pt-2">
                <h2 className="text-base sm:text-lg font-bold text-brand-primary">Technical & Core Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-md bg-surface-subtle px-3 py-1 text-xs font-semibold text-brand-primary border border-border-subtle"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Public Company Overview Card */}
          <Card className="border border-border-subtle shadow-sm bg-surface-card rounded-lg">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary text-white font-bold text-base">
                    {job.company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-brand-primary">{job.company.name}</h3>
                      {job.company.isVerified && (
                        <Badge variant="verified" className="text-[10px]">Verified</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{job.company.industry}</p>
                  </div>
                </div>

                {job.company.websiteUrl && (
                  <a
                    href={job.company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {job.company.about}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-2 border-t border-border-subtle">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> {job.company.companySize}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> HQ: {job.company.headquartersCity}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Sticky Action Card & Trust Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-20 border border-border-strong shadow-md bg-surface-card rounded-lg">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs text-text-muted font-medium">Ready to apply?</span>
                <h3 className="text-lg font-bold text-brand-primary">1-Click Direct Application</h3>
              </div>

              {/* Primary Native 1-Click Application */}
              <ApplyModal
                job={{
                  id: job.id,
                  slug: job.slug,
                  title: job.title,
                  companyName: job.company.name,
                  companyIsVerified: job.company.isVerified,
                  city: job.city,
                }}
                currentUser={currentUser}
                profile={candidateProfile}
                resumes={candidateResumes}
                alreadyApplied={alreadyApplied}
              />

              {/* Secondary Bookmark & Share */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <JobSaveButton
                  jobId={job.id}
                  initialIsSaved={isSaved}
                  isLoggedIn={!!currentUser}
                />

                <JobShareButton title={job.title} companyName={job.company.name} />
              </div>

              <div className="pt-4 border-t border-border-subtle space-y-2 text-xs text-text-muted">
                <div className="flex items-center gap-1.5 text-feedback-success-text font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Zero Fees Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Employers on WE CORPORATE are prohibited from charging candidate fees.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Opportunities Strip */}
      {relatedJobs.length > 0 && (
        <div className="pt-8 border-t border-border-subtle space-y-4">
          <h2 className="text-xl font-bold text-brand-primary">Similar Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedJobs.map((related) => (
              <JobCard key={related.id} job={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
