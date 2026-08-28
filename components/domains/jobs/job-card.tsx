import Link from "next/link";
import { PublicJob } from "@/lib/db/seed-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { MapPin, Briefcase, IndianRupee, ShieldCheck, ArrowUpRight, Clock } from "lucide-react";

interface JobCardProps {
  job: PublicJob;
  featured?: boolean;
}

export function JobCard({ job }: JobCardProps) {
  const isInternship = job.jobType === "internship";

  // Format compensation display in INR
  const compensationDisplay = isInternship
    ? `${formatINR(job.minCompensation)} - ${formatINR(job.maxCompensation)} / month`
    : `${(job.minCompensation / 100000).toFixed(1)} - ${(job.maxCompensation / 100000).toFixed(1)} LPA`;

  // Format experience label
  const experienceDisplay =
    job.experienceLevel === "freshers"
      ? "Freshers (0-1 yr)"
      : job.experienceLevel === "1-3_years"
      ? "1-3 Years"
      : job.experienceLevel === "3-5_years"
      ? "3-5 Years"
      : "5+ Years";

  // Format workplace type
  const workplaceDisplay =
    job.workplaceType === "remote"
      ? "Remote"
      : job.workplaceType === "hybrid"
      ? "Hybrid"
      : "On-site";

  // Calculate relative posted time
  const postedDate = new Date(job.publishedAt);
  const diffDays = Math.max(1, Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)));
  const timeAgo = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

  return (
    <Card className="group relative border border-border-subtle bg-surface-card hover:border-border-strong hover:shadow-md transition-all duration-standard rounded-lg">
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header: Company, Logo, Verified Trust Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Company Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-primary text-white font-bold text-sm shadow-sm">
              {job.company.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Title & Company Name */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/companies/${job.company.slug}`}
                  className="text-xs font-medium text-text-secondary hover:text-brand-primary transition-colors"
                >
                  {job.company.name}
                </Link>
                {job.company.isVerified && (
                  <Badge variant="verified" className="text-[10px] py-0 px-1.5 font-semibold">
                    <ShieldCheck className="h-3 w-3 mr-0.5" /> Verified
                  </Badge>
                )}
              </div>

              <Link href={`/jobs/${job.slug}`} className="group-hover:text-brand-accent transition-colors block mt-0.5">
                <h3 className="text-base sm:text-lg font-bold text-brand-primary leading-snug">
                  {job.title}
                </h3>
              </Link>
            </div>
          </div>

          {/* Listing Category Badge */}
          <Badge
            variant={isInternship ? "info" : "secondary"}
            className="shrink-0 text-xs capitalize hidden sm:inline-flex"
          >
            {isInternship ? "Internship" : "Full-Time"}
          </Badge>
        </div>

        {/* Metadata Strip: Location, Work Mode, Experience, Compensation */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary pt-1 border-t border-border-subtle/60">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span>{job.city}</span>
          </div>

          <div className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <span>{workplaceDisplay} • {experienceDisplay}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-brand-primary">
            <IndianRupee className="h-3.5 w-3.5 text-brand-accent shrink-0" />
            <span>{compensationDisplay}</span>
          </div>
        </div>

        {/* Footer: Skills Tags & Action Link */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {/* Skill Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-hidden max-h-6">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-sm bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-text-secondary"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[11px] text-text-muted font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>

          {/* Timestamp & CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-text-muted flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeAgo}
            </span>
            <Link href={`/jobs/${job.slug}`}>
              <Button size="sm" variant="default" className="text-xs h-8 px-3">
                View & Apply <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
