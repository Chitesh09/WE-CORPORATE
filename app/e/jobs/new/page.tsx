import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { JobCreationWizard } from "@/components/domains/employer/job-creation-wizard";
import { ArrowLeft } from "lucide-react";

export default async function PostJobWizardPage() {
  const user = await requireEmployer();
  const companyData = await employerStore.getCompanyForEmployer(user.id);

  if (!companyData) {
    notFound();
  }

  const { company } = companyData;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <Link
          href="/e/jobs"
          className="text-xs text-text-muted hover:text-brand-primary flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Job Listings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
          Create Opportunity
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Publish verified job openings and internships for students and graduates across India.
        </p>
      </div>

      <JobCreationWizard
        company={{
          id: company.id,
          name: company.name,
          isVerified: company.verificationStatus === "verified",
          verificationStatus: company.verificationStatus,
          headquartersCity: company.headquartersCity,
          headquartersState: company.headquartersState,
        }}
      />
    </div>
  );
}
