"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { candidateLoginAction } from "@/lib/actions/auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, ArrowRight, Loader2, AlertCircle, KeyRound, CheckCircle2, Building2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    startTransition(async () => {
      const result = await candidateLoginAction(null, formData);
      if (!result.success) {
        setError(result.error);
      } else {
        setSuccessMessage("Signed in successfully! Redirecting...");
        const target = callbackUrl || result.data.redirectUrl;
        setTimeout(() => {
          router.push(target);
        }, 500);
      }
    });
  };

  const fillCandidateDemo = () => {
    setEmail("rahul.sharma@example.com");
    setPassword("CandidatePass123!");
    setError(null);
  };

  const fillEmployerDemo = () => {
    setEmail("recruiter@razorpay.com");
    setPassword("EmployerPass123!");
    setError(null);
  };

  return (
    <Card className="border border-border-strong shadow-md bg-surface-card rounded-xl">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary mb-1">
            <Briefcase className="h-4 w-4 text-brand-accent" />
            <span>WE CORPORATE Account</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-primary">Welcome Back</h1>
          <p className="text-xs text-text-secondary">
            Sign in to access your Candidate Tracker or Employer Workspace.
          </p>
        </div>

        {/* Demo Credentials Quick Pill for Testing */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-text-secondary font-medium min-w-0">
              <KeyRound className="h-3.5 w-3.5 text-brand-accent shrink-0" />
              <span className="truncate">Candidate: rahul.sharma@example.com</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillCandidateDemo}
              className="text-[10px] h-6 px-2 bg-white border-border-strong font-semibold shrink-0"
            >
              Fill Candidate
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle">
            <div className="flex items-center gap-1.5 text-text-secondary font-medium min-w-0">
              <Building2 className="h-3.5 w-3.5 text-brand-accent shrink-0" />
              <span className="truncate">Employer: recruiter@razorpay.com</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillEmployerDemo}
              className="text-[10px] h-6 px-2 bg-white border-border-strong font-semibold shrink-0"
            >
              Fill Employer
            </Button>
          </div>
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
          {/* Email Address */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-text-secondary">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isPending}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-text-secondary">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-brand-accent hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isPending}
              autoComplete="current-password"
            />
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
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Links */}
        <div className="space-y-3 pt-3 border-t border-border-subtle text-center text-xs text-text-secondary">
          <p>
            Looking for jobs or internships?{" "}
            <Link href="/auth/signup" className="font-semibold text-brand-accent hover:underline">
              Create candidate account
            </Link>
          </p>
          <p>
            Are you an employer?{" "}
            <Link href="/auth/employer/signup" className="font-semibold text-brand-primary hover:underline">
              Register company workspace
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <Suspense fallback={<div className="h-96 w-full bg-surface-card rounded-xl border border-border-subtle animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
