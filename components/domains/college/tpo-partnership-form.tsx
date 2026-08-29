"use client";

import { useState, useTransition } from "react";
import { submitCollegePartnershipAction } from "@/lib/actions/college-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";

export function TpoPartnershipForm() {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{ referenceCode: string; institutionName: string } | null>(null);

  // Form State
  const [institutionName, setInstitutionName] = useState("");
  const [affiliationType, setAffiliationType] = useState("Autonomous / University Institute");
  const [tpoHeadName, setTpoHeadName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("Karnataka");
  const [city, setCity] = useState("Bengaluru");
  const [estimatedBatchSize, setEstimatedBatchSize] = useState<number>(350);
  const [selectedModes, setSelectedModes] = useState<string[]>([
    "Virtual Online Assessment",
    "6-Month Fast-Track Internships",
  ]);
  const [comments, setComments] = useState("");

  const hiringModesList = [
    "Virtual Online Assessment & Video Rounds",
    "On-Campus Pooled Placement Drive",
    "6-Month Fast-Track Internships",
    "National Hackathon Hiring Cohort",
    "Pre-Placement Talks (PPT) & Masterclasses",
  ];

  const toggleMode = (mode: string) => {
    if (selectedModes.includes(mode)) {
      setSelectedModes(selectedModes.filter((m) => m !== mode));
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (selectedModes.length === 0) {
      setStatusMessage({ type: "error", message: "Please select at least 1 preferred hiring mode." });
      return;
    }

    startTransition(async () => {
      const result = await submitCollegePartnershipAction({
        institutionName,
        affiliationType,
        tpoHeadName,
        officialEmail,
        phoneNumber,
        state,
        city,
        estimatedBatchSize: Number(estimatedBatchSize) || 100,
        preferredHiringModes: selectedModes,
        comments: comments.trim() || undefined,
      });

      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setSubmittedResult(result.data);
        setStatusMessage({ type: "success", message: result.message || "Institutional inquiry submitted successfully." });
      }
    });
  };

  return (
    <Card className="border border-border-subtle bg-surface-card rounded-2xl shadow-sm overflow-hidden" id="tpo-form">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-2 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Badge variant="verified" className="text-xs gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Official Institutional MoU & Tie-Up
            </Badge>
            <span className="text-xs text-text-muted font-medium">• 100% Free Placement Support</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-primary">
            Request Campus Placement Alliance for Your Institution
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
            Empower your graduating students with direct access to Tier-1 product tech companies, verified high-growth unicorns, and fast-track internship programs.
          </p>
        </div>

        {statusMessage && (
          <div
            role="alert"
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
              statusMessage.type === "success"
                ? "bg-feedback-success-bg text-feedback-success-text border-feedback-success-text/20"
                : "bg-feedback-error-bg text-feedback-error-text border-feedback-error-text/20"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="font-medium leading-relaxed">{statusMessage.message}</span>
          </div>
        )}

        {submittedResult ? (
          <div className="p-8 rounded-xl bg-surface-subtle border border-border-subtle text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <Award className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <Badge variant="verified" className="text-xs">
                Inquiry Logged
              </Badge>
              <h3 className="text-lg font-extrabold text-brand-primary">
                Alliance Request Registered: {submittedResult.referenceCode}
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Thank you for partnering with WE CORPORATE. Our University Relations Director will connect with your T&P cell at <strong>{officialEmail}</strong> to finalize drive dates and recruiter schedules.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmittedResult(null)}
                className="text-xs h-9 font-semibold"
              >
                Submit Another Request
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Institution & Affiliation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="instName" className="font-bold text-brand-primary">
                  College / University Name <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="instName"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. National Institute of Technology, Trichy"
                  required
                  className="text-xs h-9.5"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="affType" className="font-bold text-brand-primary">
                  Accreditation / Institution Type <span className="text-feedback-error-text">*</span>
                </label>
                <select
                  id="affType"
                  value={affiliationType}
                  onChange={(e) => setAffiliationType(e.target.value)}
                  className="w-full h-9.5 rounded-md border border-border-strong bg-surface-card px-3 text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value="Institute of National Importance (IIT / NIT / IIIT)">Institute of National Importance (IIT / NIT / IIIT)</option>
                  <option value="Autonomous / University Institute">Autonomous / State University</option>
                  <option value="Deemed-to-be University (NAAC A++/A+)">Deemed-to-be University (NAAC A++/A+)</option>
                  <option value="AICTE Approved Engineering College">AICTE Approved Engineering College</option>
                  <option value="Degree / Polytechnic College">Degree / Polytechnic College</option>
                </select>
              </div>
            </div>

            {/* Placement Officer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="tpoName" className="font-bold text-brand-primary">
                  TPO / Placement Head Name <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="tpoName"
                  value={tpoHeadName}
                  onChange={(e) => setTpoHeadName(e.target.value)}
                  placeholder="e.g. Prof. R. K. Verma"
                  required
                  className="text-xs h-9.5"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tpoEmail" className="font-bold text-brand-primary">
                  Official Institutional Email <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="tpoEmail"
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="placements@college.edu.in"
                  required
                  className="text-xs h-9.5"
                />
                <span className="text-[10px] text-text-muted">
                  Must be an official .edu.in / .ac.in / college domain email.
                </span>
              </div>
            </div>

            {/* Contact, Location & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label htmlFor="tpoPhone" className="font-bold text-brand-primary">
                  Direct Phone / Mobile <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="tpoPhone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98450 12345"
                  required
                  className="text-xs h-9.5"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tpoState" className="font-bold text-brand-primary">
                  State <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="tpoState"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Tamil Nadu"
                  required
                  className="text-xs h-9.5"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tpoCity" className="font-bold text-brand-primary">
                  City / Campus Location <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="tpoCity"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Trichy"
                  required
                  className="text-xs h-9.5"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="batchSize" className="font-bold text-brand-primary">
                  Graduating Batch Size <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="batchSize"
                  type="number"
                  min={10}
                  max={10000}
                  value={estimatedBatchSize}
                  onChange={(e) => setEstimatedBatchSize(Number(e.target.value))}
                  placeholder="e.g. 450"
                  required
                  className="text-xs h-9.5"
                />
              </div>
            </div>

            {/* Preferred Hiring Modes Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-border-subtle">
              <label className="font-bold text-brand-primary block">
                Preferred Hiring & Drive Formats <span className="text-feedback-error-text">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hiringModesList.map((mode) => {
                  const isChecked = selectedModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleMode(mode)}
                      className={`p-3 rounded-lg border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isChecked
                          ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                          : "bg-surface-subtle text-text-secondary border-border-subtle hover:bg-surface-card"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center border ${
                          isChecked ? "bg-white text-brand-primary border-white" : "border-border-strong bg-white"
                        }`}
                      >
                        {isChecked && "?"}
                      </div>
                      <span>{mode}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Remarks */}
            <div className="space-y-1">
              <label htmlFor="comments" className="font-bold text-brand-primary">
                Target CTC Expectations & Notes (Optional)
              </label>
              <textarea
                id="comments"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Mention any specific tech stack focus (e.g. Full-Stack, AI/ML), preferred drive months, or company tier preferences..."
                className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending || !institutionName.trim() || !tpoHeadName.trim() || !officialEmail.trim()}
                className="w-full sm:w-auto text-xs h-11 px-8 font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Institutional Request...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Institutional Placement Partnership</span>
                    <Sparkles className="h-4 w-4 text-brand-accent" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
