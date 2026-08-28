import Link from "next/link";
import { requireCandidate, getCandidateProfileCookie } from "@/lib/auth/session";
import { candidateStore, CandidateProfileData } from "@/lib/db/candidate-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  FileText,
  Bookmark,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";

export default async function CandidateDashboardPage() {
  const user = await requireCandidate();
  const profileCookie = (await getCandidateProfileCookie()) as CandidateProfileData | null;
  const ensuredUser = await candidateStore.ensureCandidateFromSession(user, profileCookie);

  const profileData = { user: ensuredUser, profile: ensuredUser.profile };
  const resumes = await candidateStore.getResumes(user.id);
  const savedJobs = await candidateStore.getSavedJobs(user.id);
  const applications = await candidateStore.getApplications(user.id);

  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

  // Calculate profile completeness score
  const profile = profileData?.profile;
  let completeness = 20; // 20% for registered account
  if (profile?.headline) completeness += 20;
  if (profile?.bio) completeness += 15;
  if (profile?.city) completeness += 15;
  if (profile?.skills && profile.skills.length > 0) completeness += 15;
  if (primaryResume) completeness += 15;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
              Welcome, {user.fullName.split(" ")[0]}
            </h1>
            <Badge variant="verified" className="text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" /> Active Candidate
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your candidate profile, resume vault, and track your submitted job applications.
          </p>
        </div>

        <Link href="/jobs">
          <Button size="sm" className="text-xs font-semibold">
            <Search className="h-3.5 w-3.5 mr-1.5" /> Explore Verified Jobs
          </Button>
        </Link>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completeness Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Profile Score
              </span>
              <User className="h-4 w-4 text-brand-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-brand-primary">{completeness}%</span>
              <span className="text-xs text-text-muted">
                {completeness >= 80 ? "Ready" : "Incomplete"}
              </span>
            </div>
            <div className="w-full bg-surface-subtle rounded-full h-1.5 overflow-hidden border border-border-subtle">
              <div
                className="bg-brand-accent h-1.5 rounded-full transition-all duration-standard"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <Link
              href="/c/profile"
              className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1"
            >
              Update Profile <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Primary Resume Status Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Resume Vault
              </span>
              <FileText className="h-4 w-4 text-brand-accent" />
            </div>
            {primaryResume ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 text-feedback-success-text shrink-0" />
                  <span className="truncate">{primaryResume.fileName}</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  {(primaryResume.fileSizeBytes / 1024).toFixed(0)} KB • Active
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-feedback-warning-text">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>No resume in vault</span>
                </div>
                <p className="text-[11px] text-text-muted">Upload required.</p>
              </div>
            )}
            <Link
              href="/c/resumes"
              className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1"
            >
              {primaryResume ? "Manage Resumes" : "Upload PDF"} <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Applications Tracker Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                My Applications
              </span>
              <Send className="h-4 w-4 text-brand-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-brand-primary">{applications.length}</span>
              <span className="text-xs text-text-muted">Submitted</span>
            </div>
            <p className="text-[11px] text-text-muted truncate">
              {applications.length > 0 ? "Track review stages" : "No applications yet"}
            </p>
            <Link
              href="/c/applications"
              className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1"
            >
              Application Tracker <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Saved Opportunities Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Saved Jobs
              </span>
              <Bookmark className="h-4 w-4 text-brand-accent" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-brand-primary">{savedJobs.length}</span>
              <span className="text-xs text-text-muted">Bookmarked</span>
            </div>
            <p className="text-[11px] text-text-muted truncate">
              Ready for review
            </p>
            <Link
              href="/c/saved"
              className="text-xs font-semibold text-brand-accent hover:underline inline-flex items-center gap-1"
            >
              View Saved Jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Profile Summary */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Candidate Snapshot</h2>
              <Link href="/c/profile">
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Edit Details
                </Button>
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-text-muted block">Headline:</span>
                <span className="font-semibold text-brand-primary">
                  {profile?.headline || "Not set yet"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Location:</span>
                <span className="font-medium text-brand-primary">
                  {profile?.city ? `${profile.city}, ${profile.state || ""}` : "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block">Top Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-surface-subtle text-[11px] font-medium text-text-secondary border border-border-subtle"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-muted italic">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications Activity Card */}
        <Card className="border border-border-subtle bg-surface-card shadow-sm rounded-lg">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Recent Applications</h2>
              <Link href="/c/applications">
                <Button variant="ghost" size="sm" className="text-xs h-8 text-brand-accent">
                  View All ({applications.length})
                </Button>
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Send className="h-8 w-8 text-text-muted mx-auto" />
                <p className="text-xs text-text-secondary font-medium">No applications submitted yet.</p>
                <p className="text-[11px] text-text-muted">
                  Apply to verified opportunities with 1-click using your profile snapshot and Resume Vault.
                </p>
                <Link href="/jobs">
                  <Button size="sm" className="text-xs font-semibold mt-2">
                    Browse Opportunities
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-lg border border-border-subtle bg-surface-subtle flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="overflow-hidden space-y-0.5">
                      <Link
                        href={`/jobs/${app.jobSlug}`}
                        className="font-bold text-brand-primary hover:text-brand-accent truncate block"
                      >
                        {app.jobTitle}
                      </Link>
                      <span className="text-text-muted block text-[11px]">
                        {app.companyName} •{" "}
                        {new Date(app.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <Badge variant="warning" className="shrink-0 text-[10px] capitalize">
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
