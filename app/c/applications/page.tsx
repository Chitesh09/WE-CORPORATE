import Link from "next/link";
import { requireCandidate } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { CandidateApplicationTracker } from "@/components/domains/candidate/candidate-application-tracker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default async function CandidateApplicationsPage() {
  const sessionUser = await requireCandidate();
  const applications = await candidateStore.getApplications(sessionUser.id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Application Tracker</h1>
            <Badge variant="secondary" className="text-xs">
              {applications.length} Submitted
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Monitor review stages, inspect submitted immutable snapshots, and track recruitment progress.
          </p>
        </div>

        <Link href="/jobs">
          <Button size="sm" variant="outline" className="text-xs font-semibold">
            <Search className="h-3.5 w-3.5 mr-1.5" /> Explore More Jobs
          </Button>
        </Link>
      </div>

      {/* Main Tracker Stream */}
      <CandidateApplicationTracker applications={applications} />
    </div>
  );
}
