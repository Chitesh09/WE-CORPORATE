import Link from "next/link";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  PlusCircle,
  Globe,
} from "lucide-react";

export default async function EmployerDashboardPage() {
  const user = await requireEmployer();
  const companyData = await employerStore.getCompanyForEmployer(user.id);

  if (!companyData) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-feedback-error-text mx-auto" />
        <h1 className="text-xl font-bold text-brand-primary">Company Workspace Not Found</h1>
        <p className="text-xs text-text-secondary">Please contact support@wecorporate.in for assistance.</p>
      </div>
    );
  }

  const { company } = companyData;
  const postingGate = await employerStore.canEmployerPostJobs(user.id);

  // Calculate profile completeness score
  let completeness = 30; // 30% for basic name & domain
  if (company.websiteUrl) completeness += 20;
  if (company.about && company.about.length > 30) completeness += 20;
  if (company.headquartersCity) completeness += 15;
  if (company.publicContactEmail) completeness += 15;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
              {company.name}
            </h1>
            {company.verificationStatus === "verified" ? (
              <Badge variant="verified" className="text-xs">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Employer
              </Badge>
            ) : company.verificationStatus === "pending" ? (
              <Badge variant="warning" className="text-xs">
                <Clock className="h-3.5 w-3.5 mr-1" /> Verification In Review
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-feedback-warning-text border-feedback-warning-text/40 bg-feedback-warning-bg/30">
                <AlertCircle className="h-3.5 w-3.5 mr-1" /> Unverified
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Recruiter Workspace managed by <strong>{user.fullName}</strong> ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/e/company">
            <Button size="sm" variant="outline" className="text-xs font-semibold">
              <Building2 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
            </Button>
          </Link>
          <Link href="/e/verification">
            <Button size="sm" className="text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Trust Verification
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Verification Status Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Trust Status
              </span>
              <ShieldCheck className="h-4 w-4 text-brand-accent" />
            </div>
            {company.verificationStatus === "verified" ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-feedback-success-text">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approved Hiring Partner</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Eligible for zero-fee job and internship publishing.
                </p>
              </div>
            ) : company.verificationStatus === "pending" ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-feedback-warning-text">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Under Admin Review</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Submitted on{" "}
                  {new Date(company.verificationSubmittedAt || Date.now()).toLocaleDateString("en-IN")}.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-feedback-warning-text">
                  <AlertCircle className="h-4 w-4" />
                  <span>Verification Required</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Submit business registration to unlock job postings.
                </p>
              </div>
            )}
            <Link
              href="/e/verification"
              className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1 pt-1"
            >
              {company.verificationStatus === "verified" ? "View Verification Record" : "Submit Evidence"}{" "}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Company Profile Completeness Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Company Profile
              </span>
              <Building2 className="h-4 w-4 text-brand-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-brand-primary">{completeness}%</span>
              <span className="text-xs text-text-muted">
                {completeness >= 80 ? "Complete" : "Needs Details"}
              </span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-2 overflow-hidden border border-border-subtle">
              <div
                className="bg-brand-accent h-2 rounded-full transition-all duration-standard"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <Link
              href="/e/company"
              className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1"
            >
              Manage Public Page <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Job Posting Authorization Gate Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Posting Gate
              </span>
              <Briefcase className="h-4 w-4 text-brand-accent" />
            </div>
            {postingGate.allowed ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                  <CheckCircle2 className="h-4 w-4 text-feedback-success-text" />
                  <span>Job Creation Unlocked</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Wizard launches in Phase 7.3C.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <Lock className="h-4 w-4 text-text-muted" />
                  <span>Job Posting Locked</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Admin approval required to prevent fraudulent listings.
                </p>
              </div>
            )}
            <div className="pt-1">
              <span className="text-[11px] text-text-muted block">
                Zero fees enforced on all candidates.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Public Snapshot Preview */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Public Company Card</h2>
              <Link href={`/companies/${company.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  <Globe className="h-3.5 w-3.5 mr-1" /> View Public Page
                </Button>
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-text-muted block">Industry:</span>
                <span className="font-semibold text-brand-primary">{company.industry}</span>
              </div>
              <div>
                <span className="text-text-muted block">Headquarters:</span>
                <span className="font-semibold text-brand-primary">
                  {company.headquartersCity}
                  {company.headquartersState ? `, ${company.headquartersState}` : ""}, India
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Corporate Website:</span>
                <span className="font-mono text-brand-accent">
                  {company.websiteUrl || "https://" + company.corporateDomain}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">About Summary:</span>
                <p className="text-text-secondary leading-relaxed line-clamp-3">
                  {company.about}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase 7.3C & 7.3D Roadmap Guidance */}
        <Card className="border border-border-strong bg-gradient-to-br from-surface-card to-surface-subtle shadow-sm rounded-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-brand-accent" />
                <h2 className="text-base font-bold text-brand-primary">Upcoming Recruiter Tools</h2>
              </div>
              <Badge variant="secondary" className="text-[10px]">Roadmap</Badge>
            </div>

            <div className="space-y-3 text-xs text-text-secondary">
              <div className="p-3 rounded-lg bg-surface-card border border-border-subtle space-y-1">
                <span className="font-bold text-brand-primary block">Phase 7.3C — Job Posting Wizard</span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Post full-time jobs and internships with structured compensation (LPA / stipend), screening requirements, and zero candidate fees.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-card border border-border-subtle space-y-1">
                <span className="font-bold text-brand-primary block">Phase 7.3D — Lite ATS & Applicant Review</span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Review submitted immutable application snapshots, manage stages (Applied $\rightarrow$ Shortlisted $\rightarrow$ Hired), and download presigned resumes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
