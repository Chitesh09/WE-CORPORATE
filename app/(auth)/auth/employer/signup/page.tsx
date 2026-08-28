"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { employerSignupAction } from "@/lib/actions/auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Building2, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function EmployerSignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await employerSignupAction(null, formData);
      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      } else {
        setSuccessMessage("Employer account created! Redirecting to workspace...");
        setTimeout(() => {
          router.push(result.data.redirectUrl);
        }, 1000);
      }
    });
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <Card className="border border-border-strong shadow-md bg-surface-card rounded-xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Employer Network</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-primary">Employer Registration</h1>
            <p className="text-xs text-text-secondary">
              Register your organization to hire verified students, graduates, and professionals.
            </p>
          </div>

          {/* Global Error Banner */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-md bg-feedback-error-bg text-feedback-error-text text-xs flex items-start gap-2 border border-feedback-error-text/20"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-md bg-feedback-success-bg text-feedback-success-text text-xs flex items-center gap-2 border border-feedback-success-text/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recruiter Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-xs font-semibold text-text-secondary">
                Recruiter / Representative Name <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Ananya Deshmukh"
                required
                disabled={isPending}
                error={fieldErrors.fullName?.[0]}
                autoComplete="name"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label htmlFor="companyName" className="text-xs font-semibold text-text-secondary">
                Company / Organization Name <span className="text-feedback-error-text">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="e.g. Razorpay Software Pvt Ltd"
                  required
                  disabled={isPending}
                  error={fieldErrors.companyName?.[0]}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Work Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-text-secondary">
                Official Work Email <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="recruiter@company.com"
                required
                disabled={isPending}
                error={fieldErrors.email?.[0]}
                autoComplete="email"
              />
              <p className="text-[11px] text-text-muted">
                Used for corporate domain verification and candidate inquiries.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-text-secondary">
                Account Password <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min 8 chars with 1 uppercase & 1 number"
                required
                disabled={isPending}
                error={fieldErrors.password?.[0]}
                autoComplete="new-password"
              />
            </div>

            {/* Terms & Employer Covenant Consent */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-secondary leading-relaxed">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  required
                  disabled={isPending}
                  className="mt-0.5 h-4 w-4 rounded border-border-strong text-brand-accent focus:ring-brand-accent"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="text-brand-accent hover:underline font-semibold" target="_blank">
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link href="/privacy" className="text-brand-accent hover:underline font-semibold" target="_blank">
                    Privacy Policy
                  </Link>
                  , and zero-fee employer compliance standards.
                </span>
              </label>
              {fieldErrors.agreeTerms && (
                <p className="mt-1 text-xs text-feedback-error-text font-medium">
                  {fieldErrors.agreeTerms[0]}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering Organization...</span>
                </>
              ) : (
                <>
                  <span>Create Employer Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="space-y-3 pt-3 border-t border-border-subtle text-center text-xs text-text-secondary">
            <p>
              Already registered as an employer?{" "}
              <Link href="/auth/login" className="font-semibold text-brand-accent hover:underline">
                Sign in
              </Link>
            </p>
            <p>
              Looking for jobs or internships?{" "}
              <Link href="/auth/signup" className="font-semibold text-brand-primary hover:underline">
                Candidate Signup
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
