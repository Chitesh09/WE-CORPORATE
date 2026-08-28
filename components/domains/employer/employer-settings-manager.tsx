"use client";

import { useState, useTransition } from "react";
import { changeEmployerPasswordAction } from "@/lib/actions/employer-actions";
import { EmployerUserRecord, CompanyRecord } from "@/lib/db/employer-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";

interface EmployerSettingsManagerProps {
  user: EmployerUserRecord;
  company: CompanyRecord;
}

export function EmployerSettingsManager({ user, company }: EmployerSettingsManagerProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPending, startTransition] = useTransition();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await changeEmployerPasswordAction({
        currentPassword,
        newPassword,
      });

      if (!result.success) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(null), 4000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Account & Organization Overview */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-primary">Recruiter Account Profile</h2>
              <p className="text-xs text-text-secondary">
                Private identity details tied to your employer workspace.
              </p>
            </div>
            <Badge variant="verified" className="text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Active Recruiter
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-muted block">Representative Name:</span>
              <span className="font-semibold text-brand-primary">{user.fullName}</span>
            </div>
            <div>
              <span className="text-text-muted block">Official Work Email:</span>
              <span className="font-semibold text-brand-primary font-mono">{user.email}</span>
            </div>
            <div>
              <span className="text-text-muted block">Linked Organization:</span>
              <span className="font-semibold text-brand-primary">{company.name}</span>
            </div>
            <div>
              <span className="text-text-muted block">Account Created:</span>
              <span className="text-text-secondary">
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Password & Security */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
        <CardContent className="p-6 md:p-8 space-y-5">
          <div className="space-y-1 pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand-accent" />
              <h2 className="text-base font-bold text-brand-primary">Security & Password</h2>
            </div>
            <p className="text-xs text-text-secondary">
              Update your account credentials using bcrypt salted hashing.
            </p>
          </div>

          {passwordError && (
            <div
              role="alert"
              className="p-3 rounded-md bg-feedback-error-bg text-feedback-error-text text-xs flex items-center gap-2 border border-feedback-error-text/20"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-md bg-feedback-success-bg text-feedback-success-text text-xs flex items-center gap-2 border border-feedback-success-text/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-medium">{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="text-xs font-semibold text-text-secondary">
                Current Password <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-xs font-semibold text-text-secondary">
                New Password <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase & 1 number"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-secondary">
                Confirm New Password <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isPending}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="text-xs font-semibold h-10 px-5 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
