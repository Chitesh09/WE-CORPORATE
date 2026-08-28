import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { jobStore } from "@/lib/db/job-store";
import { EmployerJobManager } from "@/components/domains/employer/employer-job-manager";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function EmployerJobsPage() {
  const user = await requireEmployer();
  const companyData = await employerStore.getCompanyForEmployer(user.id);

  if (!companyData) {
    notFound();
  }

  const { company } = companyData;
  const companyJobs = await jobStore.getJobsByCompany(company.id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Job Listings</h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your organization&apos;s published career opportunities, review drafts, and track moderation progress.
          </p>
        </div>

        <Link href="/e/jobs/new">
          <Button size="sm" className="text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Post New Opportunity
          </Button>
        </Link>
      </div>

      <EmployerJobManager
        jobs={companyJobs}
        isCompanyVerified={company.verificationStatus === "verified"}
        companyVerificationStatus={company.verificationStatus}
      />
    </div>
  );
}
