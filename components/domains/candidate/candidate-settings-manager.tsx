"use client";

import { useState, useTransition } from "react";
import { changePasswordAction, exportCandidateDataAction } from "@/lib/actions/candidate-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  KeyRound,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

interface CandidateSettingsManagerProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    createdAt?: string;
  };
}

export function CandidateSettingsManager({ user }: CandidateSettingsManagerProps) {
  const [isPendingPassword, startTransitionPassword] = useTransition();
  const [isPendingExport, startTransitionExport] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", message: "New passwords do not match." });
      return;
    }

    startTransitionPassword(async () => {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
      });

      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({ type: "success", message: "Your password has been changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleExportData = () => {
    setStatusMessage(null);
    startTransitionExport(async () => {
      const result = await exportCandidateDataAction();
      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        // Trigger browser JSON download
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `we_corporate_candidate_data_${user.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setStatusMessage({
          type: "success",
          message: "Data export generated and downloaded to your device.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-md text-xs flex items-center gap-2 border ${
            statusMessage.type === "success"
              ? "bg-feedback-success-bg text-feedback-success-text border-feedback-success-text/20"
              : "bg-feedback-error-bg text-feedback-error-text border-feedback-error-text/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.message}</span>
        </div>
      )}

      {/* 1. Account Summary */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider pb-2 border-b border-border-subtle">
            1. Account Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-muted block font-medium">Account Name</span>
              <span className="font-bold text-brand-primary mt-0.5 block">{user.fullName}</span>
            </div>

            <div>
              <span className="text-text-muted block font-medium">Email Address</span>
              <span className="font-bold text-brand-primary mt-0.5 block">{user.email}</span>
            </div>

            <div>
              <span className="text-text-muted block font-medium">Account Type</span>
              <span className="font-bold text-brand-primary mt-0.5 block capitalize">{user.role}</span>
            </div>

            <div>
              <span className="text-text-muted block font-medium">Account State</span>
              <Badge variant="verified" className="mt-1 text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1" /> Active & Verified
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Change Password */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
            <KeyRound className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
              2. Security & Password
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-1">
              <label htmlFor="currentPassword" className="text-xs font-semibold text-text-secondary">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isPendingPassword}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="newPassword" className="text-xs font-semibold text-text-secondary">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                disabled={isPendingPassword}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-secondary">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isPendingPassword}
              />
            </div>

            <Button
              type="submit"
              disabled={isPendingPassword}
              className="text-xs h-10 px-5 font-bold"
            >
              {isPendingPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 3. Data Transparency & Portability */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
            <Info className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
              3. Privacy & Data Portability
            </h2>
          </div>

          <div className="space-y-3 text-xs text-text-secondary">
            <p>
              WE CORPORATE is designed to support applicable privacy and data-protection requirements. You maintain full ownership over your candidate profile and personal data.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-text-muted">
              <li>Profile data is stored solely for matchmaking and job applications.</li>
              <li>Your contact information is only shared with verified employers when you explicitly apply.</li>
              <li>You can export your complete data snapshot at any time.</li>
            </ul>

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportData}
                disabled={isPendingExport}
                className="text-xs h-9 px-4 font-semibold border-border-strong"
              >
                {isPendingExport ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 mr-1.5 text-brand-accent" /> Export My Data (JSON)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Account Deletion Request State */}
      <Card className="border border-feedback-error-text/20 bg-feedback-error-bg/20 rounded-lg">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-feedback-error-text font-bold text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Danger Zone: Account Deletion</span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Deleting your account will permanently remove your candidate profile and Resume Vault. Immutable historical job applications submitted to employers will be anonymized in accordance with statutory compliance policies.
          </p>

          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              disabled
              className="text-xs h-9 px-4 text-feedback-error-text border-feedback-error-text/30 bg-transparent cursor-not-allowed"
            >
              Request Account Deletion (Pending Phase 8 Data Lifecycle)
            </Button>
            <span className="block text-[11px] text-text-muted mt-1">
              Automated one-click deletion will activate upon deployment of the complete archival pipeline.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
