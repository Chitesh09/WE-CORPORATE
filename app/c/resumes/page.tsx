import { requireCandidate } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { ResumeVaultManager } from "@/components/domains/candidate/resume-vault-manager";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default async function CandidateResumesPage() {
  const sessionUser = await requireCandidate();
  const resumes = await candidateStore.getResumes(sessionUser.id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Resume Vault</h1>
            <Badge variant="verified" className="text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" /> Encrypted Vault
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Store, version, and manage your PDF resumes for 1-click applications across verified employers.
          </p>
        </div>
      </div>

      {/* Resume Vault Interactive Component */}
      <ResumeVaultManager resumes={resumes} />
    </div>
  );
}
