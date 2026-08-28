"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

interface JobSkillMatchProps {
  candidateSkills: string[];
  requiredSkills: string[];
  candidateName?: string;
}

export function JobSkillMatch({
  candidateSkills = [],
  requiredSkills = [],
  candidateName,
}: JobSkillMatchProps) {
  const { matched, missing, matchPercentage, ratingLabel, ratingColor } = useMemo(() => {
    if (!requiredSkills || requiredSkills.length === 0) {
      return {
        matched: candidateSkills,
        missing: [],
        matchPercentage: 100,
        ratingLabel: "High Match",
        ratingColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      };
    }

    const normalizedCandidate = new Set(
      candidateSkills.map((s) => s.trim().toLowerCase())
    );

    const matchedList: string[] = [];
    const missingList: string[] = [];

    requiredSkills.forEach((skill) => {
      const norm = skill.trim().toLowerCase();
      if (normalizedCandidate.has(norm)) {
        matchedList.push(skill);
      } else {
        missingList.push(skill);
      }
    });

    const ratio = matchedList.length / requiredSkills.length;
    const pct = Math.round(Math.max(ratio * 100, candidateSkills.length > 0 ? 15 : 5));

    let label = "Moderate Match";
    let color = "text-amber-700 bg-amber-50 border-amber-200";

    if (pct >= 75) {
      label = "Strong Match";
      color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (pct >= 45) {
      label = "Good Match";
      color = "text-brand-accent bg-teal-50 border-teal-200";
    }

    return {
      matched: matchedList,
      missing: missingList,
      matchPercentage: pct,
      ratingLabel: label,
      ratingColor: color,
    };
  }, [candidateSkills, requiredSkills]);

  return (
    <Card className="border border-border-strong bg-white/95 backdrop-blur-md rounded-xl shadow-xs overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header with Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
              <Sparkles className="h-4 w-4 text-brand-accent" />
              <span>AI Profile & Skill Match</span>
            </div>
            <p className="text-xs text-text-muted">
              Calculated against your verified candidate profile {candidateName ? `(${candidateName})` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xl font-extrabold text-brand-primary leading-none">
                {matchPercentage}%
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${ratingColor}`}>
              {ratingLabel}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-border-subtle">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              matchPercentage >= 75
                ? "bg-emerald-500"
                : matchPercentage >= 45
                ? "bg-brand-accent"
                : "bg-amber-500"
            }`}
            style={{ width: `${matchPercentage}%` }}
          />
        </div>

        {/* Matched & Missing Skills Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
          {/* Matched Skills */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Matched Skills ({matched.length})</span>
            </div>
            {matched.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {matched.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">No direct skill matches found in profile.</p>
            )}
          </div>

          {/* Missing / Recommended Skills */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 font-semibold text-amber-800">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              <span>Recommended to Highlight ({missing.length})</span>
            </div>
            {missing.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {missing.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50/70 text-amber-900 border border-amber-200/80"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-medium">You meet all required technical skills!</p>
            )}
          </div>
        </div>

        {/* Update Profile Tip Link */}
        <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
          <span>Missing skills? Add them to your profile before applying.</span>
          <Link
            href="/c/profile"
            className="text-brand-accent hover:text-brand-accent-hover font-semibold inline-flex items-center gap-0.5"
          >
            Update Profile <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
