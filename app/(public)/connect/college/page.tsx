import { Metadata } from "next";
import { CollegeConnectHero } from "@/components/domains/college/college-connect-hero";
import { CampusDrivesSchedule } from "@/components/domains/college/campus-drives-schedule";
import { TpoPartnershipForm } from "@/components/domains/college/tpo-partnership-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "College Connect & Campus Placement Alliance | WE CORPORATE",
  description:
    "Partner with WE CORPORATE to bring verified campus hiring drives, top tech recruiters, and 6-month internship pipelines to your college students.",
};

export default function CollegeConnectPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. Hero & Impact Numbers */}
      <CollegeConnectHero />

      {/* 2. Live Campus Hiring Drives Schedule */}
      <div className="space-y-4" id="campus-drives-section">
        <div className="space-y-1 pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Badge variant="verified" className="text-xs gap-1">
              <Calendar className="h-3 w-3" /> Live Campus Drives
            </Badge>
            <span className="text-xs text-text-muted font-medium">• 2025 & 2026 Batches</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">
            Upcoming National Campus Placement Drives
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Students and College TPOs can register directly for upcoming pooled drives and virtual assessment rounds.
          </p>
        </div>

        <CampusDrivesSchedule />
      </div>

      {/* 3. How the Alliance Works for Colleges (3-Step Stepper) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold text-brand-accent tracking-wider">
            Seamless Placement Pipeline
          </span>
          <h2 className="text-2xl font-bold text-brand-primary">
            How WE CORPORATE Powers Campus Placements
          </h2>
          <p className="text-xs text-text-secondary">
            From initial batch onboarding to final offer letter rollout in under 14 days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-border-subtle bg-surface-card rounded-xl shadow-xs">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-brand-accent font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-brand-primary">Institutional MoU & Batch Sync</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                TPO submits institutional details and shares eligible student batch rosters. WE CORPORATE generates custom college assessment portals.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border-subtle bg-surface-card rounded-xl shadow-xs">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-brand-accent font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-brand-primary">Proctored AI Online Assessment</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Students take standardized coding, CS fundamentals, and aptitude rounds. Live ranking boards give recruiters immediate shortlist readiness.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border-subtle bg-surface-card rounded-xl shadow-xs">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-brand-accent font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-brand-primary">Fast-Track Interviews & Offers</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Recruiters conduct virtual or on-campus interviews with zero administrative friction. Transparent offer letters released with fixed CTC guarantees.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Official Institutional TPO Partnership Form */}
      <TpoPartnershipForm />

      {/* 5. TPO Frequently Asked Questions */}
      <div className="space-y-4 pt-6 border-t border-border-subtle">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-brand-primary">
            Frequently Asked Questions for Placement Cells
          </h2>
          <p className="text-xs text-text-secondary">
            Clear guidelines on compliance, cost structure, and recruiter verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2">
            <span className="font-bold text-brand-primary text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              Are there any hidden fees for our college or students?
            </span>
            <p className="text-text-secondary leading-relaxed pl-5">
              No. WE CORPORATE operates on a strict <strong>100% Zero-Fee Trust Policy</strong> for academic institutions and student candidates. We never charge registration fees, assessment fees, or offer fees.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2">
            <span className="font-bold text-brand-primary text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              Which companies participate in these campus drives?
            </span>
            <p className="text-text-secondary leading-relaxed pl-5">
              Participating employers include verified Tier-1 product tech companies, funded high-growth startups, and specialized tech enterprises (e.g. Razorpay, Nexus Cloud, Kredo FinTech, ZetaStream Labs).
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2">
            <span className="font-bold text-brand-primary text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              Can we request customized drives exclusively for our campus?
            </span>
            <p className="text-text-secondary leading-relaxed pl-5">
              Yes. For institutions with batch sizes exceeding 300 students, we organize dedicated single-institute on-campus or virtual hackathon recruitment cohorts.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2">
            <span className="font-bold text-brand-primary text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              How do we track student selection statuses?
            </span>
            <p className="text-text-secondary leading-relaxed pl-5">
              TPO coordinators receive dedicated dashboard access and real-time email digest reports detailing student shortlists, assessment percentiles, and offer letter rollouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
