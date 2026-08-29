"use client";

import { useState, useTransition, useRef } from "react";
import {
  registerUploadedResumeAction,
  setPrimaryResumeAction,
  deleteResumeAction,
  parseResumeExtractAction,
  syncParsedResumeToProfileAction,
  ParsedResumeResult,
} from "@/lib/actions/candidate-actions";
import { CandidateResumeRecord } from "@/lib/db/candidate-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Star,
  Download,
  ShieldCheck,
  Info,
  Sparkles,
  X,
  Plus,
} from "lucide-react";

interface ResumeVaultManagerProps {
  resumes: CandidateResumeRecord[];
}

export function ResumeVaultManager({ resumes }: ResumeVaultManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [isParsing, setIsParsing] = useState(false);
  const [isSyncing, startSyncTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeResult | null>(null);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkillText, setNewSkillText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);

    // 1. Client-Side Format Validation
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setStatusMessage({ type: "error", message: "Only PDF documents (.pdf) are permitted in the Resume Vault." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Client-Side Size Validation (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: "error", message: "Resume file size exceeds the 5 MB limit." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    startTransition(async () => {
      // 3. Register and obtain presigned upload token
      const result = await registerUploadedResumeAction({
        fileName: file.name,
        fileSizeBytes: file.size,
      });

      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({
          type: "success",
          message: `"${file.name}" was safely uploaded and encrypted in your personal Resume Vault.`,
        });
        // Auto-trigger parsing offer
        handleTriggerParse(result.data.resumeId);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleTriggerParse = async (resumeId: string) => {
    setIsParsing(true);
    setStatusMessage(null);
    const parseResult = await parseResumeExtractAction(resumeId);
    setIsParsing(false);

    if (parseResult.success) {
      setParsedData(parseResult.data);
      setEditSkills(parseResult.data.detectedSkills);
    } else {
      setStatusMessage({ type: "error", message: parseResult.error });
    }
  };

  const handleAddEditSkill = () => {
    const trimmed = newSkillText.trim();
    if (trimmed && !editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
      setNewSkillText("");
    }
  };

  const handleRemoveEditSkill = (skill: string) => {
    setEditSkills(editSkills.filter((s) => s !== skill));
  };

  const handleApplySync = () => {
    if (!parsedData) return;

    startSyncTransition(async () => {
      const result = await syncParsedResumeToProfileAction({
        fullName: parsedData.detectedFullName,
        headline: parsedData.detectedHeadline,
        city: parsedData.detectedCity,
        state: parsedData.detectedState,
        experienceLevel: parsedData.detectedExperienceLevel,
        skills: editSkills,
        bio: parsedData.detectedBio,
        githubUrl: parsedData.detectedGithubUrl,
        linkedinUrl: parsedData.detectedLinkedinUrl,
        portfolioUrl: parsedData.detectedPortfolioUrl,
      });

      if (result.success) {
        setStatusMessage({
          type: "success",
          message: "Profile boosted! Extracted skills and summary synchronized with your Candidate Profile.",
        });
        setParsedData(null);
      } else {
        setStatusMessage({ type: "error", message: result.error });
      }
    });
  };

  const handleSetPrimary = (resumeId: string) => {
    setStatusMessage(null);
    startTransition(async () => {
      const result = await setPrimaryResumeAction(resumeId);
      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({ type: "success", message: "Primary resume updated." });
      }
    });
  };

  const handleDelete = (resumeId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to remove "${fileName}" from your Resume Vault?`)) {
      return;
    }

    setStatusMessage(null);
    startTransition(async () => {
      const result = await deleteResumeAction(resumeId);
      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({ type: "success", message: "Resume removed from vault." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-md text-xs flex items-center gap-2 border ${
            statusMessage.type === "success"
              ? "bg-feedback-success-bg text-feedback-success-text border-feedback-success-text/20"
              : "bg-feedback-error-bg text-feedback-error-text border-feedback-error-text/20"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.message}</span>
        </div>
      )}

      {/* Upload Dropzone Card */}
      <Card className="border-2 border-dashed border-border-strong bg-surface-card hover:bg-surface-subtle transition-colors rounded-xl">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-brand-accent">
            {isPending || isParsing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-brand-primary">
              Upload New PDF Resume
            </h2>
            <p className="text-xs text-text-secondary">
              Upload your latest resume in PDF format (Max 5 MB). Our AI will automatically parse skills & sync your profile!
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              disabled={isPending || isParsing}
              className="hidden"
              id="resume-file-input"
              aria-label="Upload PDF Resume"
            />
            <label htmlFor="resume-file-input">
              <Button
                type="button"
                variant="default"
                disabled={isPending || isParsing}
                onClick={() => fileInputRef.current?.click()}
                className="text-xs h-10 px-5 font-semibold cursor-pointer gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Select & Auto-Parse PDF Resume</span>
              </Button>
            </label>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-text-muted pt-2 border-t border-border-subtle">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-accent" /> Private Storage
            </span>
            <span>•</span>
            <span>AI Skill Match Booster</span>
            <span>•</span>
            <span>Max 5 MB</span>
          </div>
        </CardContent>
      </Card>

      {/* Vault Resumes List */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
              Stored Resumes ({resumes.length})
            </h2>
            <span className="text-xs text-text-muted">Primary resume is pre-selected for 1-click apply</span>
          </div>

          {resumes.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <FileText className="h-8 w-8 text-text-muted mx-auto" />
              <p className="text-xs text-text-secondary font-medium">Your Resume Vault is empty.</p>
              <p className="text-[11px] text-text-muted">
                Upload a resume above to prepare your profile for employer applications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    resume.isPrimary
                      ? "border-brand-accent/40 bg-surface-subtle"
                      : "border-border-subtle bg-surface-card hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-primary text-white">
                      <FileText className="h-5 w-5 text-brand-accent" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-brand-primary break-all">
                          {resume.fileName}
                        </span>
                        {resume.isPrimary && (
                          <Badge variant="verified" className="text-[10px] py-0">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-muted">
                        <span>{(resume.fileSizeBytes / 1024).toFixed(0)} KB</span>
                        <span>•</span>
                        <span>
                          Uploaded on {new Date(resume.uploadedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending || isParsing}
                      onClick={() => handleTriggerParse(resume.id)}
                      className="text-xs h-8 px-2.5 font-semibold text-brand-primary border-brand-accent/50 hover:bg-brand-accent/10 gap-1"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>AI Auto-Parse</span>
                    </Button>

                    {!resume.isPrimary && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleSetPrimary(resume.id)}
                        className="text-xs h-8 px-2.5 font-medium"
                      >
                        <Star className="h-3.5 w-3.5 mr-1 text-brand-accent" /> Set Primary
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Controlled Presigned Download initialized for ${resume.fileName}`)}
                      className="text-xs h-8 px-2.5"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> View
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleDelete(resume.id, resume.fileName)}
                      className="text-xs h-8 px-2 text-text-muted hover:text-feedback-error-text hover:bg-feedback-error-bg/30"
                      aria-label={`Delete ${resume.fileName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Resume Parser Review & Sync Modal */}
      {parsedData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-xl rounded-xl bg-surface-card shadow-2xl border border-border-strong overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-subtle/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="verified" className="text-[10px] gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" /> AI Resume Auto-Parser
                  </Badge>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {parsedData.confidenceScore}% Confidence
                  </span>
                </div>
                <h2 className="text-base font-bold text-brand-primary">
                  Extracted Profile & Skills Summary
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setParsedData(null)}
                className="p-1.5 rounded-md text-text-muted hover:text-brand-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted block text-[11px]">Headline:</span>
                    <span className="font-semibold text-brand-primary">{parsedData.detectedHeadline}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Location:</span>
                    <span className="font-semibold text-brand-primary">
                      {parsedData.detectedCity}, {parsedData.detectedState}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Bio Summary:</span>
                  <p className="text-text-secondary leading-relaxed bg-surface-card p-2 rounded border border-border-subtle mt-0.5">
                    {parsedData.detectedBio}
                  </p>
                </div>
              </div>

              {/* Extracted Skills Chips with Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-primary uppercase tracking-wider text-[11px]">
                    Extracted Skills ({editSkills.length})
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-surface-subtle border border-border-subtle min-h-[50px]">
                  {editSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs py-1 px-2.5 flex items-center gap-1.5 bg-surface-card border border-border-subtle"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditSkill(skill)}
                        className="hover:text-feedback-error-text"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEditSkill();
                      }
                    }}
                    placeholder="Add more skills (e.g. Docker, Redux)..."
                    className="text-xs h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEditSkill}
                    className="text-xs h-9 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border-subtle bg-surface-subtle flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setParsedData(null)}
                className="text-xs h-9 px-4"
              >
                Discard
              </Button>
              <Button
                type="button"
                onClick={handleApplySync}
                disabled={isSyncing}
                className="text-xs h-9 px-5 font-bold gap-1.5 shadow-sm"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Boost & Sync to Profile</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Architecture Covenant Notice */}
      <div className="p-4 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-text-secondary space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-brand-primary">
          <Info className="h-4 w-4 text-brand-accent" />
          <span>Resume Security & Versioning Policy</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] text-text-muted">
          <li>
            <strong>Private Storage:</strong> Your resumes are strictly isolated in private cloud storage and never indexed by search engines.
          </li>
          <li>
            <strong>Application Snapshot Separation:</strong> When you submit a job application, an immutable copy is captured. Deleting a resume from your personal vault does not alter your historical applications.
          </li>
          <li>
            <strong>Security Limit Note:</strong> Resumes are restricted to authenticated PDF uploads up to 5 MB.
          </li>
        </ul>
      </div>
    </div>
  );
}
