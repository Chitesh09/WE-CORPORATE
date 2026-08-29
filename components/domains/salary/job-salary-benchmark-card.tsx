"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getSalaryBenchmark } from "@/lib/data/salary-benchmarks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";

interface JobSalaryBenchmarkCardProps {
  job: {
    title: string;
    city: string;
    experienceLevel: string;
    minCompensation: number;
    maxCompensation: number;
    compensationType: "annual_ctc" | "monthly_stipend";
  };
}

export function JobSalaryBenchmarkCard({ job }: JobSalaryBenchmarkCardProps) {
  const benchmark = useMemo(() => {
    if (job.compensationType !== "annual_ctc") return null;
    return getSalaryBenchmark(job.title, job.experienceLevel, job.city);
  }, [job.title, job.experienceLevel, job.city, job.compensationType]);

  if (!benchmark) return null;

  const jobMidLpa = (job.minCompensation + job.maxCompensation) / 2 / 100000;
  const isCompetitive = jobMidLpa >= benchmark.medianLpa;

  return (
    <Card className="border border-brand-accent/30 bg-gradient-to-r from-brand-accent/5 via-surface-card to-surface-subtle rounded-xl shadow-xs overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-brand-accent" />
            <span>Salary Benchmark Comparison</span>
          </div>
          <Badge
            variant={isCompetitive ? "verified" : "secondary"}
            className="text-[10px] py-0.5"
          >
            {isCompetitive ? "Above Market Median" : "Market Competitive"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-md bg-surface-card border border-border-subtle">
            <span className="text-[10px] text-text-muted block">This Role</span>
            <span className="font-bold text-brand-primary">
              ?{(job.minCompensation / 100000).toFixed(1)} - {(job.maxCompensation / 100000).toFixed(1)} LPA
            </span>
          </div>

          <div className="p-2 rounded-md bg-surface-card border border-border-subtle">
            <span className="text-[10px] text-text-muted block">Market Median</span>
            <span className="font-bold text-emerald-700">?{benchmark.medianLpa.toFixed(1)} LPA</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-2 rounded-md bg-surface-card border border-border-subtle">
            <span className="text-[10px] text-text-muted block">75th Percentile</span>
            <span className="font-bold text-brand-accent">?{benchmark.p75Lpa.toFixed(1)} LPA</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-text-secondary">
          <span>Based on live tech hiring in {benchmark.city}</span>
          <Link
            href="/salary-insights"
            className="text-brand-accent font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Explore Full Index</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
