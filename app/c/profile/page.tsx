import { requireCandidate } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { CandidateProfileForm } from "@/components/domains/candidate/candidate-profile-form";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default async function CandidateProfilePage() {
  const sessionUser = await requireCandidate();
  let profileRecord = await candidateStore.getProfile(sessionUser.id);

  if (!profileRecord) {
    const user = await candidateStore.ensureCandidateFromSession(sessionUser);
    profileRecord = { user, profile: user.profile };
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Candidate Profile</h1>
            <Badge variant="verified" className="text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" /> Verified Identity
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Keep your profile up-to-date. Recruiters evaluate this snapshot during 1-click applications.
          </p>
        </div>
      </div>

      {/* Main Profile Form */}
      <CandidateProfileForm
        user={profileRecord.user}
        profile={profileRecord.profile}
      />
    </div>
  );
}
