import { requireCandidate } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { CandidateSettingsManager } from "@/components/domains/candidate/candidate-settings-manager";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default async function CandidateSettingsPage() {
  const sessionUser = await requireCandidate();
  const candidateRecord = await candidateStore.findById(sessionUser.id);

  if (!candidateRecord) {
    throw new Error("Candidate account record not found.");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Account Settings</h1>
            <Badge variant="verified" className="text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" /> Security & Privacy
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your account credentials, security settings, and data transparency preferences.
          </p>
        </div>
      </div>

      {/* Settings Manager Component */}
      <CandidateSettingsManager user={candidateRecord} />
    </div>
  );
}
