import Link from "next/link";
import { requireCandidate } from "@/lib/auth/session";
import { careerServiceStore } from "@/lib/db/career-service-store";
import { CandidateConsultingManager } from "@/components/domains/candidate/candidate-consulting-manager";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CandidateConsultingPage() {
  const user = await requireCandidate();
  const orders = await careerServiceStore.getOrdersForCandidate(user.id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
              Consulting & Advisory Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage your 1-on-1 resume reviews, mock interviews, and career strategy advisory bookings.
          </p>
        </div>

        <Link href="/career-services">
          <Button size="sm" className="text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Book New Session
          </Button>
        </Link>
      </div>

      <CandidateConsultingManager orders={orders} />
    </div>
  );
}
