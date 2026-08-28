import Link from "next/link";
import { requireCandidate } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { DEVELOPMENT_JOBS } from "@/lib/db/seed-data";
import { JobCard } from "@/components/domains/jobs/job-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Search, ArrowRight } from "lucide-react";

export default async function CandidateSavedJobsPage() {
  const sessionUser = await requireCandidate();
  const savedRecords = await candidateStore.getSavedJobs(sessionUser.id);

  // Match saved IDs against public opportunities
  const savedJobs = savedRecords
    .map((record) => {
      const job = DEVELOPMENT_JOBS.find((j) => j.id === record.jobId);
      return job ? { job, savedAt: record.savedAt } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Saved Opportunities</h1>
            <Badge variant="secondary" className="text-xs">
              {savedJobs.length} Bookmarked
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Keep track of verified positions you are interested in applying for.
          </p>
        </div>

        <Link href="/jobs">
          <Button size="sm" variant="outline" className="text-xs font-semibold">
            <Search className="h-3.5 w-3.5 mr-1.5" /> Browse More Jobs
          </Button>
        </Link>
      </div>

      {/* Saved Jobs Feed */}
      {savedJobs.length === 0 ? (
        <Card className="border border-border-subtle bg-surface-card rounded-lg">
          <CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-brand-accent">
              <Bookmark className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-brand-primary">No Saved Opportunities Yet</h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                When browsing full-time jobs or student internships, click &quot;Save&quot; to bookmark opportunities here for quick access.
              </p>
            </div>
            <Link href="/jobs">
              <Button size="sm" className="text-xs font-semibold">
                Explore Verified Jobs <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map(({ job }) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
