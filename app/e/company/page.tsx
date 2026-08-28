import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { CompanyProfileForm } from "@/components/domains/employer/company-profile-form";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default async function EmployerCompanyPage() {
  const user = await requireEmployer();
  const companyData = await employerStore.getCompanyForEmployer(user.id);

  if (!companyData) {
    notFound();
  }

  const { company } = companyData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Company Profile</h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your organization&apos;s verified public branding, headquarters details, and public contact information.
          </p>
        </div>

        <Link href={`/companies/${company.slug}`} target="_blank">
          <Button size="sm" variant="outline" className="text-xs font-semibold">
            <Globe className="h-3.5 w-3.5 mr-1.5" /> View Public Page
          </Button>
        </Link>
      </div>

      {/* Main Profile Form */}
      <CompanyProfileForm initialCompany={company} />
    </div>
  );
}
