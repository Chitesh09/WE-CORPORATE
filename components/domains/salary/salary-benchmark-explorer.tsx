"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  SALARY_BENCHMARKS,
  CITY_COMPENSATION_MULTIPLIERS,
  SalaryBenchmark,
} from "@/lib/data/salary-benchmarks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";

export function SalaryBenchmarkExplorer() {
  const [selectedRoleTitle, setSelectedRoleTitle] = useState("Frontend / React Engineer");
  const [selectedExpLevel, setSelectedExpLevel] = useState<"freshers" | "1-3_years" | "3-5_years" | "5-8_years">("1-3_years");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");

  const availableRoles = useMemo(() => {
    return Array.from(new Set(SALARY_BENCHMARKS.map((b) => b.roleTitle)));
  }, []);

  const availableExpLevels: Array<{ id: "freshers" | "1-3_years" | "3-5_years" | "5-8_years"; label: string }> = [
    { id: "freshers", label: "Freshers (0 - 1 yr)" },
    { id: "1-3_years", label: "Early Career (1 - 3 yrs)" },
    { id: "3-5_years", label: "Mid-Level (3 - 5 yrs)" },
    { id: "5-8_years", label: "Senior & Staff (5 - 8 yrs)" },
  ];

  const availableCities = Object.keys(CITY_COMPENSATION_MULTIPLIERS);

  // Compute Active Benchmark based on selection
  const activeBenchmark = useMemo<SalaryBenchmark | null>(() => {
    const raw =
      SALARY_BENCHMARKS.find(
        (b) => b.roleTitle === selectedRoleTitle && b.experienceLevel === selectedExpLevel
      ) ||
      SALARY_BENCHMARKS.find((b) => b.roleTitle === selectedRoleTitle) ||
      SALARY_BENCHMARKS[0];

    if (!raw) return null;

    const cityMultiplier = (CITY_COMPENSATION_MULTIPLIERS[selectedCity] || { multiplier: 1.0 }).multiplier;

    return {
      ...raw,
      city: selectedCity as SalaryBenchmark["city"],
      p25Lpa: Math.round(raw.p25Lpa * cityMultiplier * 10) / 10,
      medianLpa: Math.round(raw.medianLpa * cityMultiplier * 10) / 10,
      p75Lpa: Math.round(raw.p75Lpa * cityMultiplier * 10) / 10,
      p90Lpa: Math.round(raw.p90Lpa * cityMultiplier * 10) / 10,
    };
  }, [selectedRoleTitle, selectedExpLevel, selectedCity]);

  return (
    <div className="space-y-8">
      {/* 1. Explorer Filter Controls */}
      <Card className="border border-border-subtle bg-surface-card rounded-xl shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-6">
          {/* Role Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-brand-accent" />
              <span>Select Specialization / Tech Role:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRoleTitle(role)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    selectedRoleTitle === role
                      ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                      : "bg-surface-subtle text-text-secondary border-border-subtle hover:border-border-strong hover:bg-surface-card"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-subtle">
            {/* Experience Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-brand-accent" />
                <span>Experience Level:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableExpLevels.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setSelectedExpLevel(exp.id)}
                    className={`px-3 py-2 rounded-md text-xs font-semibold border text-center transition-all ${
                      selectedExpLevel === exp.id
                        ? "bg-brand-accent text-brand-primary border-brand-accent shadow-xs font-bold"
                        : "bg-surface-subtle text-text-secondary border-border-subtle hover:bg-surface-card"
                    }`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* City Hub Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-accent" />
                <span>Location / Tech Hub:</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      selectedCity === city
                        ? "bg-brand-primary text-white border-brand-primary font-bold"
                        : "bg-surface-card text-text-secondary border-border-subtle hover:border-border-strong"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-text-muted">
                {CITY_COMPENSATION_MULTIPLIERS[selectedCity]?.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Main Salary Percentile Display */}
      {activeBenchmark && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Median & Range Card */}
          <Card className="lg:col-span-2 border border-border-subtle bg-surface-card rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="verified" className="text-xs gap-1">
                      <ShieldCheck className="h-3 w-3" /> India Market Verified
                    </Badge>
                    <span className="text-xs text-text-muted">• {selectedCity}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">
                    {activeBenchmark.roleTitle}
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {activeBenchmark.experienceLabel} • {activeBenchmark.description}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-surface-subtle p-3 rounded-lg border border-border-subtle shrink-0">
                  <span className="text-xs text-text-muted block">Median Base CTC</span>
                  <span className="text-3xl font-extrabold text-brand-primary">
                    ?{activeBenchmark.medianLpa.toFixed(1)} <span className="text-sm font-bold text-text-secondary">LPA</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    +~{activeBenchmark.typicalVariableBonusPercent}% Performance Bonus
                  </span>
                </div>
              </div>

              {/* Percentile Breakdown Strip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-brand-primary uppercase tracking-wider">
                  <span>Compensation Percentiles Breakdown</span>
                  <span className="text-text-muted lowercase font-normal">Annual CTC (INR)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
                    <span className="text-[11px] text-text-muted block">25th Percentile (Entry)</span>
                    <span className="text-lg font-bold text-brand-primary">?{activeBenchmark.p25Lpa.toFixed(1)} LPA</span>
                    <span className="text-[10px] text-text-muted block">Early Startups / Service</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-brand-accent/10 border border-brand-accent/40 space-y-1">
                    <span className="text-[11px] font-bold text-brand-primary block">Median (50th)</span>
                    <span className="text-lg font-extrabold text-brand-primary">?{activeBenchmark.medianLpa.toFixed(1)} LPA</span>
                    <span className="text-[10px] text-brand-primary/80 font-medium block">Standard Product Co.</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
                    <span className="text-[11px] text-text-muted block">75th Percentile (Top Tier)</span>
                    <span className="text-lg font-bold text-brand-primary">?{activeBenchmark.p75Lpa.toFixed(1)} LPA</span>
                    <span className="text-[10px] text-text-muted block">Series B+ / Unicorns</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1">
                    <span className="text-[11px] text-text-muted block">90th Percentile (Elite)</span>
                    <span className="text-lg font-bold text-brand-primary">?{activeBenchmark.p90Lpa.toFixed(1)} LPA</span>
                    <span className="text-[10px] text-text-muted block">Tier-1 Big Tech / MNCs</span>
                  </div>
                </div>
              </div>

              {/* Visual Relative Range Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Entry: ?{activeBenchmark.p25Lpa} LPA</span>
                  <span className="font-bold text-brand-primary">Median: ?{activeBenchmark.medianLpa} LPA</span>
                  <span>Elite: ?{activeBenchmark.p90Lpa} LPA</span>
                </div>
                <div className="relative h-4 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-400 via-brand-accent to-emerald-500 rounded-full"
                    style={{ left: "10%", width: "80%" }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-brand-primary shadow-md transform -translate-x-1/2"
                    style={{ left: "50%" }}
                    title="Median"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* High-Value Skills Matrix & Match CTA */}
          <div className="space-y-6">
            <Card className="border border-border-subtle bg-surface-card rounded-xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Key Skills Commanding This Bracket</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeBenchmark.topSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs py-1 px-2.5 bg-surface-subtle border border-border-strong text-brand-primary font-semibold"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed pt-2 border-t border-border-subtle">
                  Candidates mastering these core frameworks typically negotiate at the <strong>75th percentile (?{activeBenchmark.p75Lpa} LPA+)</strong> in this experience bracket.
                </p>

                <Link
                  href={`/jobs?keyword=${encodeURIComponent(activeBenchmark.roleTitle.split("/")[0].trim())}&experienceLevel=${activeBenchmark.experienceLevel}`}
                  className="block w-full"
                >
                  <Button className="w-full text-xs h-10 font-bold flex items-center justify-center gap-1.5 shadow-sm">
                    <span>Explore Verified Jobs in this Bracket</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Smart Job Alert Promo */}
            <div className="p-4 rounded-xl border border-brand-accent/30 bg-gradient-to-r from-brand-accent/10 to-surface-subtle space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-brand-primary">
                <Award className="h-4 w-4 text-brand-accent" />
                <span>Set Automated Salary Alert</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Get notified immediately when new roles offering <strong>= ?{activeBenchmark.medianLpa} LPA</strong> are published.
              </p>
              <Link href="/c/alerts" className="inline-block pt-1">
                <Button variant="outline" size="sm" className="text-xs h-8 font-semibold border-brand-accent/40 text-brand-primary">
                  Create Instant Job Alert
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
