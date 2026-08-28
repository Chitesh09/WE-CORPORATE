import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Send,
  Sparkles,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const candidateNavItems = [
  { title: "Dashboard", href: "/c/dashboard", icon: LayoutDashboard },
  { title: "My Profile", href: "/c/profile", icon: User },
  { title: "Resume Vault", href: "/c/resumes", icon: FileText },
  { title: "Saved Opportunities", href: "/c/saved", icon: Bookmark },
  { title: "My Applications", href: "/c/applications", icon: Send },
  { title: "Consulting Sessions", href: "/c/consulting", icon: Sparkles, badge: "Phase 7.4" },
  { title: "Account Settings", href: "/c/settings", icon: Settings },
];

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "candidate") {
    redirect("/auth/login?callbackUrl=/c/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-canvas text-text-primary">
      {/* Responsive Candidate Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-r border-border-subtle bg-surface-card p-4 sm:p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base text-brand-primary pb-4 border-b border-border-subtle"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-white shadow-sm">
              <Briefcase className="h-4 w-4 text-brand-accent" />
            </div>
            <span>WE Candidate</span>
          </Link>

          {/* User Profile Summary Pill */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-xs">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="block font-bold text-xs text-brand-primary truncate">
                {user.fullName}
              </span>
              <span className="block text-[11px] text-text-muted truncate">
                {user.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Candidate Navigation" className="space-y-1">
            {candidateNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-text-secondary hover:bg-surface-subtle hover:text-brand-primary transition-colors focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-brand-accent shrink-0" aria-hidden="true" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-surface-canvas text-text-muted px-1.5 py-0.5 rounded border border-border-subtle">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Trust Badge & Logout */}
        <div className="pt-4 border-t border-border-subtle space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-brand-accent">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Candidate Portal</span>
          </div>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full text-xs h-9 justify-center border-border-strong text-text-secondary hover:text-feedback-error-text hover:bg-feedback-error-bg/30"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Workspace Surface */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-6xl">
        {children}
      </main>
    </div>
  );
}
