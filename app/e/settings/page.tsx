import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { EmployerSettingsManager } from "@/components/domains/employer/employer-settings-manager";

export default async function EmployerSettingsPage() {
  const sessionUser = await requireEmployer();
  const companyData = await employerStore.getCompanyForEmployer(sessionUser.id);

  if (!companyData) {
    notFound();
  }

  const { company, user } = companyData;

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Account & Security Settings</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Manage your recruiter credentials and workspace security preferences.
        </p>
      </div>

      <EmployerSettingsManager user={user} company={company} />
    </div>
  );
}
