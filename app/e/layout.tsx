import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  PlusCircle,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const employerNavItems = [
  { title: "Dashboard", href: "/e/dashboard", icon: LayoutDashboard },
  { title: "Company Profile", href: "/e/company", icon: Building2 },
  { title: "Trust Verification", href: "/e/verification", icon: ShieldCheck },
  { title: "Job Postings", href: "/e/jobs", icon: Briefcase, badge: "Phase 7.3C" },
  { title: "Create Job", href: "/e/jobs/new", icon: PlusCircle, badge: "Phase 7.3C" },
  { title: "Lite ATS", href: "/e/jobs/default/applicants", icon: Users, badge: "Phase 7.3D" },
  { title: "Account Settings", href: "/e/settings", icon: Settings },
];

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "employer") {
    redirect("/auth/login?callbackUrl=/e/dashboard");
  }

  const companyData = await employerStore.getCompanyForEmployer(user.id);
  const company = companyData?.company;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-canvas text-text-primary">
      {/* Responsive Employer Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-r border-border-subtle bg-surface-card p-4 sm:p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="space-y-3 pb-4 border-b border-border-subtle">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-brand-accent shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-brand-primary">WE CORPORATE</span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">
                  Employer Hub
                </span>
              </div>
            </Link>

            {/* Active Company Pill */}
            {company && (
              <div className="p-2.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-primary truncate max-w-[130px]">
                    {company.name}
                  </span>
                  {company.verificationStatus === "verified" ? (
                    <Badge variant="verified" className="text-[9px] py-0">
                      Verified
                    </Badge>
                  ) : company.verificationStatus === "pending" ? (
                    <Badge variant="warning" className="text-[9px] py-0">
                      Reviewing
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] py-0 text-text-muted">
                      Unverified
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-text-muted truncate">{user.fullName}</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {employerNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-text-secondary hover:text-brand-primary hover:bg-surface-subtle transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-text-muted group-hover:text-brand-accent transition-colors shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-subtle text-text-muted border border-border-subtle">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: User Pill & Sign Out Action */}
        <div className="pt-4 border-t border-border-subtle space-y-3">
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-brand-primary block truncate">{user.fullName}</span>
            <span className="text-text-muted block text-[11px] truncate">{user.email}</span>
          </div>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold h-8 text-feedback-error-text hover:bg-feedback-error-bg/30 border-border-subtle flex items-center justify-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
