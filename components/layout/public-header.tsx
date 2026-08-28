"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { logoutAction } from "@/lib/actions/auth-actions";
import { SessionUser } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Briefcase, ShieldCheck, Menu, X, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";

interface PublicHeaderProps {
  user?: SessionUser | null;
}

export function PublicHeader({ user }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardUrl =
    user?.role === "candidate"
      ? "/c/dashboard"
      : user?.role === "employer"
      ? "/e/dashboard"
      : "/admin/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-brand-primary focus-visible:ring-2 focus-visible:ring-border-focus rounded-md"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary text-white shadow-sm">
            <Briefcase className="h-5 w-5 text-brand-accent" />
          </div>
          <span className="tracking-tight">WE CORPORATE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary"
        >
          {siteConfig.mainNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-brand-primary py-1 focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm",
                  isActive &&
                    "text-brand-primary font-semibold border-b-2 border-brand-accent"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardUrl}>
                <Button variant="outline" size="sm" className="text-xs font-semibold border-border-strong">
                  <LayoutDashboard className="mr-1.5 h-3.5 w-3.5 text-brand-accent" />
                  Dashboard
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-text-secondary hover:text-feedback-error-text hover:bg-feedback-error-bg/30"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Log Out
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-xs font-semibold">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="default" size="sm" className="text-xs font-semibold">
                  Sign up
                </Button>
              </Link>
              <Link href="/auth/employer/signup" className="hidden lg:inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border-strong text-xs font-semibold"
                >
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-brand-accent" />
                  For Employers
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Link href={dashboardUrl} className="sm:hidden">
              <Button variant="outline" size="sm" className="text-xs px-2.5 h-8">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login" className="sm:hidden">
              <Button variant="ghost" size="sm" className="text-xs px-2 h-8">
                Log in
              </Button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-subtle focus-visible:ring-2 focus-visible:ring-border-focus"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-strong bg-surface-card px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-standard">
          {user && (
            <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate text-xs">
                  <span className="font-bold text-brand-primary block truncate">{user.fullName}</span>
                  <span className="text-text-muted capitalize block truncate">{user.role}</span>
                </div>
              </div>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 px-2 text-feedback-error-text hover:bg-feedback-error-bg/30"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" /> Log Out
                </Button>
              </form>
            </div>
          )}

          <nav className="space-y-1">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between py-2.5 px-3 rounded-md text-sm font-medium text-text-secondary hover:bg-surface-subtle hover:text-brand-primary transition-colors",
                    isActive && "bg-surface-subtle text-brand-primary font-bold"
                  )}
                >
                  <span>{item.title}</span>
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-border-subtle space-y-2">
            {user ? (
              <Link
                href={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full"
              >
                <Button className="w-full justify-center">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button className="w-full justify-center">Create Candidate Account</Button>
                </Link>
                <Link
                  href="/auth/employer/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full justify-center border-border-strong text-xs">
                    <ShieldCheck className="mr-1.5 h-4 w-4 text-brand-accent" />
                    Employer Portal Registration
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
