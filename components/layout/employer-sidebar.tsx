"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-actions";
import { SessionUser } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowRight,
  Compass,
} from "lucide-react";

const employerNavItems = [
  { title: "Dashboard", href: "/e/dashboard", icon: LayoutDashboard },
  { title: "Company Profile", href: "/e/company", icon: Building2 },
  { title: "Trust Verification", href: "/e/verification", icon: ShieldCheck },
  { title: "Job Postings", href: "/e/jobs", icon: Briefcase },
  { title: "Post a Job", href: "/e/jobs/new", icon: PlusCircle },
  { title: "ATS Kanban Pipeline", href: "/e/jobs", icon: Users },
  { title: "Account Settings", href: "/e/settings", icon: Settings },
];

interface EmployerSidebarProps {
  user: SessionUser;
  company: {
    name: string;
    verificationStatus: string;
  } | null;
}

export function EmployerSidebar({ user, company }: EmployerSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 1. Mobile Top Navigation Bar with Hamburger */}
      <div className="md:hidden sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/e/dashboard" className="flex items-center gap-2 font-bold text-sm text-brand-primary">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary text-brand-accent shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <span>Employer Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          {company && (
            <Badge
              variant={
                company.verificationStatus === "verified"
                  ? "verified"
                  : company.verificationStatus === "pending"
                  ? "warning"
                  : "secondary"
              }
              className="text-[10px] py-0"
            >
              {company.verificationStatus === "verified" ? "Verified" : "Pending"}
            </Badge>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-subtle border border-border-subtle transition-colors focus-visible:ring-2 focus-visible:ring-border-focus"
            aria-label="Toggle employer navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-brand-primary" /> : <Menu className="h-5 w-5 text-brand-primary" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden sticky top-[53px] z-30 w-full border-b border-border-strong bg-surface-card px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-between">
            <div className="min-w-0">
              <span className="font-bold text-xs text-brand-primary block truncate">{company?.name || user.fullName}</span>
              <span className="text-[11px] text-text-muted truncate block">{user.email}</span>
            </div>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-feedback-error-text hover:bg-feedback-error-bg/30"
              >
                <LogOut className="h-3 w-3 mr-1" /> Sign Out
              </Button>
            </form>
          </div>

          {/* Navigation Links in Mobile Hamburger */}
          <nav className="grid grid-cols-1 gap-1">
            {employerNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/e/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-lg text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-brand-primary text-white shadow-xs font-bold"
                      : "text-text-secondary hover:bg-surface-subtle hover:text-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-brand-accent" : "text-text-muted")} />
                    <span>{item.title}</span>
                  </div>
                  <ArrowRight className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-text-muted")} />
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-brand-accent font-semibold hover:underline flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" /> Return to Website
            </Link>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Recruiter Verified
            </span>
          </div>
        </div>
      )}

      {/* 2. Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border-subtle bg-surface-card p-4 sm:p-6 flex-col justify-between space-y-6">
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
              const isActive = pathname === item.href || (item.href !== "/e/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-border-focus",
                    isActive
                      ? "bg-brand-primary text-white font-bold shadow-xs"
                      : "text-text-secondary hover:text-brand-primary hover:bg-surface-subtle"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-brand-accent" : "text-text-muted")} />
                    <span>{item.title}</span>
                  </div>
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
    </>
  );
}
