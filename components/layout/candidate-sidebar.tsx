"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-actions";
import { SessionUser } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  Menu,
  X,
  Bell,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  Compass,
} from "lucide-react";

const candidateNavItems = [
  { title: "Dashboard", href: "/c/dashboard", icon: LayoutDashboard },
  { title: "My Profile", href: "/c/profile", icon: User },
  { title: "Resume Vault", href: "/c/resumes", icon: FileText },
  { title: "Job Alerts", href: "/c/alerts", icon: Bell },
  { title: "Saved Jobs", href: "/c/saved", icon: Bookmark },
  { title: "Applications", href: "/c/applications", icon: Send },
  { title: "Salary Insights", href: "/salary-insights", icon: TrendingUp },
  { title: "Campus Drives", href: "/connect/college", icon: GraduationCap },
  { title: "Consulting", href: "/c/consulting", icon: Sparkles },
  { title: "Settings", href: "/c/settings", icon: Settings },
];

interface CandidateSidebarProps {
  user: SessionUser;
}

export function CandidateSidebar({ user }: CandidateSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 1. Mobile Top Navigation Bar with Hamburger */}
      <div className="md:hidden sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/c/dashboard" className="flex items-center gap-2 font-bold text-sm text-brand-primary">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-primary text-white shadow-xs">
            <Briefcase className="h-3.5 w-3.5 text-brand-accent" />
          </div>
          <span>Candidate Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[11px]">
            {user.fullName.slice(0, 2).toUpperCase()}
          </div>
          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-subtle border border-border-subtle transition-colors focus-visible:ring-2 focus-visible:ring-border-focus"
            aria-label="Toggle candidate navigation menu"
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
              <span className="font-bold text-xs text-brand-primary block truncate">{user.fullName}</span>
              <span className="text-[11px] text-text-muted truncate block">{user.email}</span>
            </div>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-feedback-error-text hover:bg-feedback-error-bg/30"
              >
                <LogOut className="h-3 w-3 mr-1" /> Log Out
              </Button>
            </form>
          </div>

          {/* Navigation Links in Mobile Hamburger */}
          <nav className="grid grid-cols-1 gap-1">
            {candidateNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/c/dashboard" && pathname.startsWith(item.href));

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
            <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className="text-brand-accent font-semibold hover:underline flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" /> Browse All Jobs
            </Link>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
        </div>
      )}

      {/* 2. Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border-subtle bg-surface-card p-4 sm:p-6 flex-col justify-between space-y-6">
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
              const isActive = pathname === item.href || (item.href !== "/c/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-border-focus",
                    isActive
                      ? "bg-brand-primary text-white font-bold shadow-xs"
                      : "text-text-secondary hover:bg-surface-subtle hover:text-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-brand-accent" : "text-text-muted")} aria-hidden="true" />
                    <span>{item.title}</span>
                  </div>
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
              className="w-full text-xs font-semibold text-text-secondary hover:text-feedback-error-text hover:bg-feedback-error-bg/30 border-border-strong justify-start"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Log Out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
