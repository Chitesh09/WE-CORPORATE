import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { VerificationForm } from "@/components/domains/employer/verification-form";

export default async function EmployerVerificationPage() {
  const user = await requireEmployer();
  const companyData = await employerStore.getCompanyForEmployer(user.id);

  if (!companyData) {
    notFound();
  }

  const { company } = companyData;
  const existingSubmission = await employerStore.getVerificationSubmission(user.id);

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Corporate Trust Verification</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Validate your business credentials to enable zero-fee job and internship publishing.
        </p>
      </div>

      <VerificationForm company={company} existingSubmission={existingSubmission} />
    </div>
  );
}
