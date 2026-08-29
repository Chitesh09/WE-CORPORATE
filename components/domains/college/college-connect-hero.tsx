"use client";

import { GraduationCap, ShieldCheck, TrendingUp, Building2, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollegeConnectHero() {
  const scrollToSchedule = () => {
    const el = document.getElementById("campus-drives-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToForm = () => {
    const el = document.getElementById("tpo-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Main Hero Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-brand-primary via-brand-primary to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-lg border border-brand-primary/20">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/20 border border-brand-accent/40 text-xs font-bold text-brand-accent">
            <GraduationCap className="h-4 w-4" />
            <span>National Campus Placement & TPO Alliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Connect Your Students to India&apos;s High-Growth Tech Companies
          </h1>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
            Empower your Training & Placement Cell (TPO) with direct campus recruitment drives, pooled national hiring hackathons, and structured 6-month internship pipelines with 100% verified compensation.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={scrollToSchedule}
              className="bg-brand-accent hover:bg-brand-accent/90 text-brand-primary font-bold text-xs h-11 px-6 shadow-md"
            >
              <span>Explore Live Campus Drives</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <Button
              onClick={scrollToForm}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs h-11 px-6 font-semibold"
            >
              <span>Institutional TPO Partnership Form</span>
            </Button>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* 4 Trust Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-surface-card border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Building2 className="h-3.5 w-3.5 text-brand-accent" />
            <span>Partner Institutions</span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-primary">145+</span>
          <p className="text-[11px] text-text-muted">IITs, NITs, IIITs & State Universities</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-surface-card border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>Avg Fresher Package</span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-primary">?8.5 <span className="text-base font-bold text-text-secondary">LPA</span></span>
          <p className="text-[11px] text-text-muted">Direct product roles & internships</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-surface-card border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" />
            <span>Institutional Cost</span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-primary">100% Free</span>
          <p className="text-[11px] text-text-muted">Zero charges for colleges or students</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-surface-card border border-border-subtle shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Users className="h-3.5 w-3.5 text-brand-accent" />
            <span>Students Placed</span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-primary">3,800+</span>
          <p className="text-[11px] text-text-muted">Across 2024, 2025 & 2026 Batches</p>
        </div>
      </div>
    </div>
  );
}
