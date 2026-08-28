"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitApplicationAction } from "@/lib/actions/application-actions";
import { CandidateResumeRecord, CandidateProfileData } from "@/lib/db/candidate-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

interface ApplyModalProps {
  job: {
    id: string;
    slug: string;
    title: string;
    companyName: string;
    companyIsVerified: boolean;
    city: string;
  };
  currentUser?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  profile?: CandidateProfileData | null;
  resumes?: CandidateResumeRecord[];
  alreadyApplied?: boolean;
}

export function ApplyModal({
  job,
  currentUser,
  profile,
  resumes = [],
  alreadyApplied = false,
}: ApplyModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"compose" | "review" | "success">("compose");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];
  const [selectedResumeId, setSelectedResumeId] = useState<string>(primaryResume?.id || "");
  const [coverNote, setCoverNote] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-open modal if callback URL had ?apply=true
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("apply") === "true" && currentUser && !alreadyApplied) {
        setIsOpen(true);
      }
    }
  }, [currentUser, alreadyApplied]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && step !== "success") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, step]);

  const handleOpenModal = () => {
    if (!currentUser) {
      router.push(`/auth/login?callbackUrl=/jobs/${job.slug}?apply=true`);
      return;
    }
    setIsOpen(true);
    setStep("compose");
    setErrorMessage(null);
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedResumeId) {
      setErrorMessage("Please select a resume from your vault to attach.");
      return;
    }

    if (!consentAgreed) {
      setErrorMessage("You must agree to share your application details with the employer.");
      return;
    }

    setStep("review");
  };

  const handleConfirmSubmit = () => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await submitApplicationAction({
        jobId: job.id,
        resumeId: selectedResumeId,
        coverNote: coverNote.trim() || undefined,
        consentAgreed: true,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        setStep("compose");
      } else {
        setSubmittedAppId(result.data.applicationId);
        setStep("success");
      }
    });
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) || primaryResume;

  // Render Already Applied CTA
  if (alreadyApplied) {
    return (
      <div className="space-y-2">
        <div className="p-3 rounded-md bg-feedback-success-bg border border-feedback-success-text/20 text-xs text-feedback-success-text flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 font-bold" />
          <span className="font-semibold">Application Submitted</span>
        </div>
        <Link href="/c/applications" className="block w-full">
          <Button variant="outline" className="w-full text-xs h-10 border-border-strong font-medium">
            View Application in Tracker <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Primary Apply Trigger Button */}
      <Button
        type="button"
        onClick={handleOpenModal}
        className="w-full h-11 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
      >
        <Send className="h-4 w-4" />
        <span>1-Click Direct Apply</span>
      </Button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Apply for ${job.title} at ${job.companyName}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in duration-standard overflow-y-auto"
        >
          <div
            ref={modalRef}
            className="w-full max-w-xl rounded-xl bg-surface-card shadow-2xl border border-border-strong overflow-hidden my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-subtle/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-muted">Application Pipeline</span>
                  <Badge variant="verified" className="text-[10px]">
                    <ShieldCheck className="h-3 w-3 mr-0.5" /> 1-Click
                  </Badge>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-brand-primary line-clamp-1">
                  {job.title}
                </h2>
                <p className="text-xs text-text-secondary">
                  {job.companyName} • {job.city}
                </p>
              </div>

              {step !== "success" && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close application dialog"
                  className="p-1.5 rounded-md text-text-muted hover:bg-surface-subtle hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="m-5 p-3 rounded-md bg-feedback-error-bg text-feedback-error-text text-xs flex items-center gap-2 border border-feedback-error-text/20"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Compose & Customization */}
            {step === "compose" && (
              <form onSubmit={handleProceedToReview} className="p-6 space-y-5">
                {/* 1. Candidate Snapshot Identity */}
                <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-primary">{currentUser?.fullName}</span>
                    <span className="text-text-muted">{currentUser?.email}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary truncate">
                    {profile?.headline || "No headline set"}
                  </p>
                </div>

                {/* 2. Resume Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                      Attach Resume from Vault <span className="text-feedback-error-text">*</span>
                    </label>
                    <Link
                      href="/c/resumes"
                      target="_blank"
                      className="text-[11px] font-semibold text-brand-accent hover:underline"
                    >
                      + Upload New PDF
                    </Link>
                  </div>

                  {resumes.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-feedback-warning-text/40 bg-feedback-warning-bg/20 text-center space-y-2">
                      <FileText className="h-6 w-6 text-feedback-warning-text mx-auto" />
                      <p className="text-xs font-semibold text-brand-primary">No resumes found in your Vault</p>
                      <p className="text-[11px] text-text-muted">
                        Upload a PDF resume to your personal Resume Vault to submit applications.
                      </p>
                      <Link href="/c/resumes" target="_blank">
                        <Button type="button" size="sm" variant="outline" className="text-xs h-8">
                          Open Resume Vault
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {resumes.map((resume) => (
                        <label
                          key={resume.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedResumeId === resume.id
                              ? "border-brand-accent bg-brand-accent/5"
                              : "border-border-subtle hover:border-border-strong bg-surface-card"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="selectedResume"
                              value={resume.id}
                              checked={selectedResumeId === resume.id}
                              onChange={() => setSelectedResumeId(resume.id)}
                              className="h-4 w-4 text-brand-accent focus:ring-brand-accent"
                            />
                            <div className="overflow-hidden">
                              <span className="font-semibold text-xs text-brand-primary block truncate max-w-xs sm:max-w-sm">
                                {resume.fileName}
                              </span>
                              <span className="text-[10px] text-text-muted block">
                                {(resume.fileSizeBytes / 1024).toFixed(0)} KB • Uploaded on{" "}
                                {new Date(resume.uploadedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          </div>
                          {resume.isPrimary && (
                            <Badge variant="verified" className="text-[9px] py-0 shrink-0">
                              Primary
                            </Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Optional Cover Note */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="coverNote" className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                      Short Note to Hiring Team <span className="text-text-muted font-normal">(Optional)</span>
                    </label>
                    <span className="text-[11px] text-text-muted">{coverNote.length}/1000</span>
                  </div>
                  <textarea
                    id="coverNote"
                    rows={3}
                    maxLength={1000}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Highlight your most relevant project, core skills, or why you are a great fit for this role..."
                    className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
                  />
                </div>

                {/* 4. Mandatory Explicit Consent */}
                <div className="pt-2 border-t border-border-subtle">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-secondary leading-relaxed">
                    <input
                      type="checkbox"
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      required
                      className="mt-0.5 h-4 w-4 rounded border-border-strong text-brand-accent focus:ring-brand-accent shrink-0"
                    />
                    <span>
                      I explicitly consent to creating an immutable application snapshot and sharing my profile and selected resume with <strong>{job.companyName}</strong>.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-xs h-10 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={resumes.length === 0 || !consentAgreed}
                    className="text-xs h-10 px-6 font-bold flex items-center gap-1.5"
                  >
                    <span>Review Application</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: Review Before Final Submit */}
            {step === "review" && (
              <div className="p-6 space-y-5">
                <div className="p-4 rounded-lg bg-surface-subtle border border-border-subtle space-y-3 text-xs">
                  <h3 className="font-bold text-sm text-brand-primary pb-2 border-b border-border-subtle">
                    Application Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-text-muted block">Position:</span>
                      <span className="font-semibold text-brand-primary">{job.title}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Employer:</span>
                      <span className="font-semibold text-brand-primary">{job.companyName}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Candidate:</span>
                      <span className="font-semibold text-brand-primary">{currentUser?.fullName}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Attached Resume:</span>
                      <span className="font-semibold text-brand-accent truncate block">
                        {selectedResume?.fileName}
                      </span>
                    </div>
                  </div>

                  {coverNote && (
                    <div className="pt-2 border-t border-border-subtle">
                      <span className="text-text-muted block mb-1">Cover Note:</span>
                      <p className="p-2.5 rounded bg-surface-card border border-border-subtle text-[11px] text-text-secondary whitespace-pre-line">
                        {coverNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-md bg-feedback-info-bg/30 text-feedback-info-text text-xs flex items-center gap-2 border border-feedback-info-text/20">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>An immutable snapshot of your resume & profile will be captured upon submission.</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("compose")}
                    disabled={isPending}
                    className="text-xs h-10 px-4"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Edit
                  </Button>

                  <Button
                    type="button"
                    onClick={handleConfirmSubmit}
                    disabled={isPending}
                    className="text-xs h-10 px-6 font-bold flex items-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Confirm & Submit Application</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Success Confirmation */}
            {step === "success" && (
              <div className="p-8 text-center space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-feedback-success-bg text-feedback-success-text">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-brand-primary">Application Submitted!</h2>
                  <p className="text-xs text-text-secondary max-w-md mx-auto">
                    Your profile snapshot and verified resume have been successfully transmitted to the hiring team at <strong>{job.companyName}</strong>.
                  </p>
                  {submittedAppId && (
                    <p className="text-[11px] text-text-muted font-mono pt-1">
                      Reference ID: {submittedAppId}
                    </p>
                  )}
                </div>

                <Card className="border border-border-subtle bg-surface-subtle text-left max-w-md mx-auto">
                  <CardContent className="p-4 space-y-1 text-xs text-text-secondary">
                    <div className="flex items-center justify-between font-bold text-brand-primary">
                      <span>Status: Applied</span>
                      <Badge variant="warning" className="text-[10px]">Applied</Badge>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      You can track your application review stages anytime in your Candidate Tracker.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link href="/c/applications" className="w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto text-xs font-bold h-10 px-5">
                      Go to Application Tracker <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/jobs");
                    }}
                    className="w-full sm:w-auto text-xs h-10 px-4"
                  >
                    Browse More Opportunities
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
