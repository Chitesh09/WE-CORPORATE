import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { jobStore } from "@/lib/db/job-store";
import { candidateStore } from "@/lib/db/candidate-store";
import { LiteAtsApplicantManager } from "@/components/domains/employer/lite-ats-applicant-manager";

interface EmployerApplicantsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployerApplicantsPage({ params }: EmployerApplicantsPageProps) {
  const { id: jobId } = await params;
  const user = await requireEmployer();
  const companyData = await employerStore.getCompanyForEmployer(user.id);

  if (!companyData) {
    notFound();
  }

  const job = await jobStore.getJobById(jobId);
  if (!job) {
    notFound();
  }

  // IDOR & Authorization Gate: Job must belong to the employer's company
  if (job.companyId !== companyData.company.id && job.company.slug !== companyData.company.slug) {
    notFound();
  }

  const applications = await candidateStore.getApplicationsForJob(companyData.company.id, jobId);

  return (
    <div className="space-y-6 max-w-5xl">
      <LiteAtsApplicantManager
        job={{
          id: job.id,
          title: job.title,
          slug: job.slug,
          status: job.status,
          city: job.city,
          state: job.state,
          jobType: job.jobType,
        }}
        initialApplications={applications}
      />
    </div>
  );
}
