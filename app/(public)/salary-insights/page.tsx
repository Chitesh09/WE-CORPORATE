import { Metadata } from "next";
import { SalaryBenchmarkExplorer } from "@/components/domains/salary/salary-benchmark-explorer";
import { TrendingUp, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "India Tech Salary Benchmarks & Compensation Explorer | WE CORPORATE",
  description:
    "Explore real-time verified compensation percentiles (25th, Median, 75th, 90th) across Indian tech hubs by role and experience level.",
};

export default function SalaryInsightsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 pb-6 border-b border-border-subtle">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-xs font-bold text-brand-primary">
          <TrendingUp className="h-3.5 w-3.5 text-brand-accent" />
          <span>India Tech Compensation Index 2026</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight">
              India Tech Salary & Compensation Benchmarks
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-3xl mt-1 leading-relaxed">
              Transparent, percentile-accurate compensation data across Indian tech hubs (Bengaluru, Hyderabad, Pune, NCR, Mumbai, Remote) to help candidates negotiate higher offers and employers benchmark competitive CTCs.
            </p>
          </div>

          <Link href="/jobs" className="shrink-0">
            <Button className="text-xs h-10 font-bold flex items-center gap-1.5 shadow-sm">
              <span>View All Verified Jobs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Interactive Explorer */}
      <SalaryBenchmarkExplorer />

      {/* Methodology & FAQ Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border-subtle text-xs">
        <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 font-bold text-brand-primary">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Zero Unverified Submissions</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            All benchmarks are derived from verified offer letters, candidate placement snapshots, and verified employer job postings on WE CORPORATE.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 font-bold text-brand-primary">
            <TrendingUp className="h-4 w-4 text-brand-accent" />
            <span>City Cost-of-Living Index</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Bengaluru serves as the baseline (1.0x). Compensation data across Hyderabad, Pune, NCR, and Remote automatically adjusts according to live regional hiring bands.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-surface-card border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 font-bold text-brand-primary">
            <HelpCircle className="h-4 w-4 text-brand-accent" />
            <span>Fixed vs Total CTC</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Figures indicate guaranteed Annual Base CTC in ? Lakhs Per Annum (LPA). Variable components, joining bonuses, and ESOP equity grants are shown separately.
          </p>
        </div>
      </div>
    </div>
  );
}
