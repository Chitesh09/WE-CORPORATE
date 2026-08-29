import { Metadata } from "next";
import { requireCandidate } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { CandidateJobAlertsManager } from "@/components/domains/candidate/candidate-job-alerts-manager";

export const metadata: Metadata = {
  title: "Smart Job Alerts & Digest | Candidate Portal",
  description: "Manage automated email alerts and notifications for new verified job openings.",
};

export default async function CandidateAlertsPage() {
  const sessionUser = await requireCandidate();
  const alerts = await candidateStore.getJobAlerts(sessionUser.id);

  return (
    <div className="space-y-6">
      <CandidateJobAlertsManager alerts={alerts} />
    </div>
  );
}
