"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJobDraftAction, submitJobForModerationAction } from "@/lib/actions/job-actions";
import { ScreeningQuestion } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  X,
  Plus,
  HelpCircle,
  Trash2,
} from "lucide-react";

interface JobCreationWizardProps {
  company: {
    id: string;
    name: string;
    isVerified: boolean;
    verificationStatus: string;
    headquartersCity: string;
    headquartersState?: string;
  };
}

export function JobCreationWizard({ company }: JobCreationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState<"full_time" | "internship" | "part_time" | "contract">("full_time");
  const [workplaceType, setWorkplaceType] = useState<"on_site" | "hybrid" | "remote">("hybrid");
  const [city, setCity] = useState(company.headquartersCity || "Bengaluru");
  const [state, setState] = useState(company.headquartersState || "Karnataka");
  const [experienceLevel, setExperienceLevel] = useState<"freshers" | "1-3_years" | "3-5_years" | "5+_years">("freshers");

  const [minCompensation, setMinCompensation] = useState<number>(600000);
  const [maxCompensation, setMaxCompensation] = useState<number>(1000000);
  const [compensationType, setCompensationType] = useState<"annual_ctc" | "monthly_stipend">("annual_ctc");

  const [description, setDescription] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [skills, setSkills] = useState<string[]>(["React", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");

  // Custom Screening Questions State
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([
    {
      id: "sq-1",
      question: "What is your official notice period?",
      type: "text",
      required: true,
    },
    {
      id: "sq-2",
      question: "Are you comfortable working from our office location specified in the listing?",
      type: "yes_no",
      required: true,
    },
  ]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<"text" | "yes_no" | "number">("text");

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: ScreeningQuestion = {
      id: `sq-${Date.now()}`,
      question: newQuestionText.trim(),
      type: newQuestionType,
      required: true,
    };
    setScreeningQuestions([...screeningQuestions, newQ]);
    setNewQuestionText("");
  };

  const handleRemoveQuestion = (id: string) => {
    setScreeningQuestions(screeningQuestions.filter((q) => q.id !== id));
  };

  const isCompanyVerified = company.verificationStatus === "verified";

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveDraft = (submitForModeration = false) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const responsibilities = responsibilitiesText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const requirements = requirementsText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    startTransition(async () => {
      const result = await createJobDraftAction({
        title,
        jobType,
        workplaceType,
        city,
        state,
        experienceLevel,
        minCompensation: Number(minCompensation),
        maxCompensation: Number(maxCompensation),
        compensationType,
        description,
        responsibilities,
        requirements,
        perks: ["Health Insurance", "Learning Stipend", "Flexible Hours"],
        skills,
        preferredSkills: [],
        screeningQuestions: screeningQuestions.length > 0 ? screeningQuestions : undefined,
        isCompensationNegotiable: false,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      if (submitForModeration) {
        const modResult = await submitJobForModerationAction(result.data.id);
        if (!modResult.success) {
          setErrorMessage(modResult.error);
        } else {
          setSuccessMessage("Job submitted for Admin Moderation!");
          setTimeout(() => router.push("/e/jobs"), 1200);
        }
      } else {
        setSuccessMessage("Job draft saved successfully.");
        setTimeout(() => router.push("/e/jobs"), 1000);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Wizard Progress Indicator */}
      <div className="grid grid-cols-5 gap-2 pb-4">
        {[
          { num: 1, label: "Basics" },
          { num: 2, label: "Location" },
          { num: 3, label: "Compensation" },
          { num: 4, label: "Details" },
          { num: 5, label: "Review" },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              step === s.num
                ? "border-brand-accent bg-brand-accent/5"
                : step > s.num
                ? "border-feedback-success-text/40 bg-surface-card text-brand-primary"
                : "border-border-subtle bg-surface-subtle text-text-muted"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  step === s.num
                    ? "bg-brand-accent text-white"
                    : step > s.num
                    ? "bg-feedback-success-bg text-feedback-success-text"
                    : "bg-surface-subtle text-text-muted border"
                }`}
              >
                {s.num}
              </span>
              <span className="truncate">{s.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Error / Success Banners */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-md bg-feedback-error-bg text-feedback-error-text text-xs flex items-center gap-2 border border-feedback-error-text/20"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-md bg-feedback-success-bg text-feedback-success-text text-xs flex items-center gap-2 border border-feedback-success-text/20">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Step 1 — Opportunity Basics</h2>
              <p className="text-xs text-text-secondary">Define the role title and employment category.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-xs font-semibold text-text-secondary">
                  Job / Internship Title <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Associate Full-Stack Engineer"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="jobType" className="text-xs font-semibold text-text-secondary">
                    Employment Type <span className="text-feedback-error-text">*</span>
                  </label>
                  <select
                    id="jobType"
                    value={jobType}
                    onChange={(e) => {
                      const val = e.target.value as typeof jobType;
                      setJobType(val);
                      if (val === "internship") {
                        setCompensationType("monthly_stipend");
                        setMinCompensation(25000);
                        setMaxCompensation(45000);
                      } else {
                        setCompensationType("annual_ctc");
                        setMinCompensation(600000);
                        setMaxCompensation(1000000);
                      }
                    }}
                    className="w-full rounded-md border border-border-strong bg-surface-card p-2.5 text-xs text-brand-primary focus:ring-2 focus:ring-border-focus"
                  >
                    <option value="full_time">Full-Time Permanent</option>
                    <option value="internship">Student / Graduate Internship</option>
                    <option value="contract">Contract</option>
                    <option value="part_time">Part-Time</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary">
                    Posting Organization
                  </label>
                  <Input value={company.name} disabled className="bg-surface-subtle text-text-muted" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!title.trim()}
                className="text-xs font-semibold h-10 px-5"
              >
                Continue to Location <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: LOCATION & WORK MODE */}
      {step === 2 && (
        <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Step 2 — Location & Work Mode</h2>
              <p className="text-xs text-text-secondary">Specify where this role is situated.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Workplace Model</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["hybrid", "on_site", "remote"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWorkplaceType(mode)}
                      className={`p-3 rounded-lg border text-center capitalize text-xs font-semibold transition-colors ${
                        workplaceType === mode
                          ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                          : "border-border-strong bg-surface-card hover:bg-surface-subtle text-text-secondary"
                      }`}
                    >
                      {mode.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-xs font-semibold text-text-secondary">
                    City <span className="text-feedback-error-text">*</span>
                  </label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-xs font-semibold text-text-secondary">
                    State / Territory <span className="text-feedback-error-text">*</span>
                  </label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border-subtle">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="text-xs h-10 px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!city.trim()}
                className="text-xs font-semibold h-10 px-5"
              >
                Continue to Compensation <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: COMPENSATION & EXPERIENCE */}
      {step === 3 && (
        <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Step 3 — Compensation & Experience</h2>
              <p className="text-xs text-text-secondary">Transparent salary/stipend ranges in INR.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="expLevel" className="text-xs font-semibold text-text-secondary">
                  Target Experience Level <span className="text-feedback-error-text">*</span>
                </label>
                <select
                  id="expLevel"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as typeof experienceLevel)}
                  className="w-full rounded-md border border-border-strong bg-surface-card p-2.5 text-xs text-brand-primary focus:ring-2 focus:ring-border-focus"
                >
                  <option value="freshers">Freshers / Entry Level (0-1 yr)</option>
                  <option value="1-3_years">1-3 Years Experience</option>
                  <option value="3-5_years">3-5 Years Experience</option>
                  <option value="5+_years">5+ Years Experience</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="minComp" className="text-xs font-semibold text-text-secondary">
                    {jobType === "internship" ? "Min Monthly Stipend (₹)" : "Min Annual CTC (₹)"}
                  </label>
                  <Input
                    id="minComp"
                    type="number"
                    value={minCompensation}
                    onChange={(e) => setMinCompensation(Number(e.target.value))}
                    min={0}
                    step={jobType === "internship" ? 5000 : 50000}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="maxComp" className="text-xs font-semibold text-text-secondary">
                    {jobType === "internship" ? "Max Monthly Stipend (₹)" : "Max Annual CTC (₹)"}
                  </label>
                  <Input
                    id="maxComp"
                    type="number"
                    value={maxCompensation}
                    onChange={(e) => setMaxCompensation(Number(e.target.value))}
                    min={0}
                    step={jobType === "internship" ? 5000 : 50000}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border-subtle">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="text-xs h-10 px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(4)}
                disabled={minCompensation > maxCompensation}
                className="text-xs font-semibold h-10 px-5"
              >
                Continue to Details <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: DESCRIPTION & SKILLS */}
      {step === 4 && (
        <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Step 4 — Description & Skills</h2>
              <p className="text-xs text-text-secondary">Provide detailed requirements and required skills.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="desc" className="text-xs font-semibold text-text-secondary">
                    Role Overview / Description <span className="text-feedback-error-text">*</span>
                  </label>
                  <span className="text-[11px] text-text-muted">{description.length}/5000</span>
                </div>
                <textarea
                  id="desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of the role, engineering environment, and team goals..."
                  className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="resp" className="text-xs font-semibold text-text-secondary">
                  Key Responsibilities <span className="text-text-muted font-normal">(One per line)</span>
                </label>
                <textarea
                  id="resp"
                  rows={3}
                  value={responsibilitiesText}
                  onChange={(e) => setResponsibilitiesText(e.target.value)}
                  placeholder="Design modular components with Next.js...&#10;Collaborate with product designers..."
                  className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reqs" className="text-xs font-semibold text-text-secondary">
                  Key Requirements <span className="text-text-muted font-normal">(One per line)</span>
                </label>
                <textarea
                  id="reqs"
                  rows={3}
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder="Proficiency with TypeScript and modern React...&#10;Strong understanding of REST APIs and databases..."
                  className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:ring-2 focus:ring-border-focus"
                />
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary block">
                  Required Skill Tags <span className="text-feedback-error-text">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs py-1 px-2.5 flex items-center gap-1.5">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-feedback-error-text"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="Type skill (e.g. Next.js, Node.js) and press Enter"
                    className="text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSkill} className="text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>

              {/* Custom Screening Questions Builder */}
              <div className="space-y-3 pt-3 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-brand-accent" />
                      <span>Custom Candidate Screening Questions ({screeningQuestions.length})</span>
                    </label>
                    <p className="text-[11px] text-text-secondary">
                      Ask candidates tailored knockout/qualification questions during their 1-Click Application.
                    </p>
                  </div>
                </div>

                {/* Existing Questions List */}
                <div className="space-y-2">
                  {screeningQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 flex-1">
                        <span className="font-semibold text-brand-primary">
                          {idx + 1}. {q.question}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <span className="capitalize">Type: {q.type.replace("_", " ")}</span>
                          <span>•</span>
                          <span className="text-feedback-error-text font-medium">Required</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-1 text-text-muted hover:text-feedback-error-text transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Question Input */}
                <div className="p-3 rounded-lg bg-surface-card border border-border-strong space-y-2.5">
                  <span className="text-xs font-semibold text-brand-primary block">Add Screening Question:</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="e.g. How many years of commercial TypeScript experience do you have?"
                      className="text-xs flex-1"
                    />
                    <select
                      value={newQuestionType}
                      onChange={(e) => setNewQuestionType(e.target.value as "text" | "yes_no" | "number")}
                      className="rounded-md border border-border-strong bg-surface-card px-2.5 py-1.5 text-xs text-brand-primary focus:ring-2 focus:ring-border-focus shrink-0"
                    >
                      <option value="text">Text Response</option>
                      <option value="yes_no">Yes / No</option>
                      <option value="number">Numeric</option>
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddQuestion}
                      disabled={!newQuestionText.trim()}
                      className="text-xs shrink-0 font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1 text-brand-accent" /> Add Question
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border-subtle">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
                className="text-xs h-10 px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep(5)}
                disabled={!description.trim() || skills.length === 0}
                className="text-xs font-semibold h-10 px-5"
              >
                Review Listing <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {step === 5 && (
        <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="pb-3 border-b border-border-subtle">
              <h2 className="text-base font-bold text-brand-primary">Step 5 — Review & Submission Gate</h2>
              <p className="text-xs text-text-secondary">Verify all details before saving or submitting for moderation.</p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-lg bg-surface-subtle border border-border-subtle space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-text-muted block">Title:</span>
                  <span className="font-bold text-brand-primary">{title}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Company:</span>
                  <span className="font-semibold text-brand-primary">{company.name}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Location:</span>
                  <span className="font-medium text-brand-primary">{city}, {state} ({workplaceType})</span>
                </div>
                <div>
                  <span className="text-text-muted block">Compensation:</span>
                  <span className="font-semibold text-brand-accent">
                    ₹{minCompensation.toLocaleString("en-IN")} - ₹{maxCompensation.toLocaleString("en-IN")}{" "}
                    {compensationType === "monthly_stipend" ? "/ mo" : "LPA"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-text-muted block mb-1">Attached Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-surface-card text-[11px] font-medium border border-border-subtle">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {screeningQuestions.length > 0 && (
                <div className="pt-2 border-t border-border-subtle">
                  <span className="text-text-muted block mb-1 font-medium">
                    Screening Questions ({screeningQuestions.length}):
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-text-secondary text-[11px]">
                    {screeningQuestions.map((q) => (
                      <li key={q.id}>
                        {q.question} <span className="text-text-muted">({q.type})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Verification Gate Notice */}
            {!isCompanyVerified ? (
              <div className="p-3.5 rounded-md bg-feedback-warning-bg/40 border border-feedback-warning-text/30 text-xs text-feedback-warning-text space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Admin Trust Verification Required</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your company verification status is <strong>{company.verificationStatus}</strong>. You can save this job as a Draft now, but Admin approval of your organization is required before submitting for live moderation.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-md bg-feedback-success-bg/30 border border-feedback-success-text/30 text-xs text-feedback-success-text flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Verified Employer: You can submit this listing for instant Admin Moderation Queue review.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(4)}
                disabled={isPending}
                className="w-full sm:w-auto text-xs h-10 px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Edit
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSaveDraft(false)}
                  disabled={isPending}
                  className="w-full sm:w-auto text-xs h-10 px-4"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Save as Draft
                </Button>

                <Button
                  type="button"
                  onClick={() => handleSaveDraft(true)}
                  disabled={isPending || !isCompanyVerified}
                  className="w-full sm:w-auto text-xs font-bold h-10 px-5 flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit for Moderation</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
