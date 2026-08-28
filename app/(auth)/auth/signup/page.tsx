"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { candidateSignupAction } from "@/lib/actions/auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CandidateSignupPage() {
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
      const result = await candidateSignupAction(null, formData);
      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      } else {
        setSuccessMessage("Account created! Redirecting to your dashboard...");
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
              <span>Verified Candidate Network</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-primary">Candidate Registration</h1>
            <p className="text-xs text-text-secondary">
              Create your account to unlock 1-click apply, Resume Vault, and verified jobs.
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
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-xs font-semibold text-text-secondary">
                Full Name <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Rahul Sharma"
                required
                disabled={isPending}
                error={fieldErrors.fullName?.[0]}
                autoComplete="name"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-text-secondary">
                Email Address <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isPending}
                error={fieldErrors.email?.[0]}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-text-secondary">
                Password <span className="text-feedback-error-text">*</span>
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
              <p className="text-[11px] text-text-muted">
                Must be at least 8 characters with 1 uppercase letter and 1 number.
              </p>
            </div>

            {/* Terms & Privacy Consent */}
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
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-brand-accent hover:underline font-semibold" target="_blank">
                    Privacy Policy
                  </Link>
                  .
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Candidate Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="space-y-3 pt-3 border-t border-border-subtle text-center text-xs text-text-secondary">
            <p>
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-brand-accent hover:underline">
                Sign in
              </Link>
            </p>
            <p>
              Are you an employer?{" "}
              <Link href="/auth/employer/signup" className="font-semibold text-brand-primary hover:underline">
                Employer Registration
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
