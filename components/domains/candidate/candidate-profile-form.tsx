"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCandidateProfileAction } from "@/lib/actions/candidate-actions";
import { CandidateUserRecord, CandidateProfileData } from "@/lib/db/candidate-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, Loader2, Plus, X, Globe, Linkedin, Github } from "lucide-react";

interface CandidateProfileFormProps {
  user: CandidateUserRecord;
  profile: CandidateProfileData;
}

export function CandidateProfileForm({ user, profile }: CandidateProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [fullName, setFullName] = useState(user.fullName);
  const [headline, setHeadline] = useState(profile.headline || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "");
  const [city, setCity] = useState(profile.city || "");
  const [state, setState] = useState(profile.state || "");
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel || "freshers");
  const [bio, setBio] = useState(profile.bio || "");
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl || "");

  // Sync state if parent props change
  useEffect(() => {
    setFullName(user.fullName);
    setHeadline(profile.headline || "");
    setPhoneNumber(profile.phoneNumber || "");
    setCity(profile.city || "");
    setState(profile.state || "");
    setExperienceLevel(profile.experienceLevel || "freshers");
    setBio(profile.bio || "");
    setSkills(profile.skills || []);
    setLinkedinUrl(profile.linkedinUrl || "");
    setGithubUrl(profile.githubUrl || "");
    setPortfolioUrl(profile.portfolioUrl || "");
  }, [user.fullName, profile]);

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const result = await updateCandidateProfileAction({
        fullName,
        headline,
        phoneNumber,
        city,
        state,
        experienceLevel,
        bio,
        skills,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
      });

      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setStatusMessage({ type: "success", message: "Your candidate profile was updated successfully." });
        if (result.data) {
          if (result.data.fullName) setFullName(result.data.fullName);
          if (result.data.headline !== undefined) setHeadline(result.data.headline);
          if (result.data.phoneNumber !== undefined) setPhoneNumber(result.data.phoneNumber);
          if (result.data.city !== undefined) setCity(result.data.city);
          if (result.data.state !== undefined) setState(result.data.state);
          if (result.data.experienceLevel !== undefined) setExperienceLevel(result.data.experienceLevel);
          if (result.data.bio !== undefined) setBio(result.data.bio);
          if (result.data.skills !== undefined) setSkills(result.data.skills);
          if (result.data.linkedinUrl !== undefined) setLinkedinUrl(result.data.linkedinUrl);
          if (result.data.githubUrl !== undefined) setGithubUrl(result.data.githubUrl);
          if (result.data.portfolioUrl !== undefined) setPortfolioUrl(result.data.portfolioUrl);
        }
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* 1. Basic Information */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider pb-2 border-b border-border-subtle">
            1. Personal & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="fullName" className="text-xs font-semibold text-text-secondary">
                Full Name <span className="text-feedback-error-text">*</span>
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-text-secondary">
                Email Address (Account ID)
              </label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-surface-subtle text-text-muted cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="phoneNumber" className="text-xs font-semibold text-text-secondary">
                Phone Number (WhatsApp / Calling)
              </label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="experienceLevel" className="text-xs font-semibold text-text-secondary">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                disabled={isPending}
                className="w-full h-10 rounded-md border border-border-strong bg-surface-card px-3 text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              >
                <option value="freshers">Freshers / Student (0 - 1 yr)</option>
                <option value="1-3_years">Early Career (1 - 3 yrs)</option>
                <option value="3-5_years">Mid-Level (3 - 5 yrs)</option>
                <option value="5+_years">Senior Professional (5+ yrs)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="city" className="text-xs font-semibold text-text-secondary">
                Current City
              </label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="state" className="text-xs font-semibold text-text-secondary">
                State / Region
              </label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka"
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Professional Headline & Bio */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider pb-2 border-b border-border-subtle">
            2. Professional Profile & Bio
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="headline" className="text-xs font-semibold text-text-secondary">
                Professional Headline
              </label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Final-year CS Student | Full-Stack Developer (React, Node.js)"
                disabled={isPending}
              />
              <p className="text-[11px] text-text-muted">
                Shown to recruiters directly on application cards.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="bio" className="text-xs font-semibold text-text-secondary">
                About / Professional Summary
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief overview of your background, projects, academic achievements, and career interests..."
                disabled={isPending}
                className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Skills Tag Editor */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider pb-2 border-b border-border-subtle">
            3. Core Technical & Professional Skills
          </h2>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                placeholder="Type a skill and press Enter (e.g. React, Python, PostgreSQL)..."
                disabled={isPending}
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                disabled={isPending || !newSkillInput.trim()}
                className="text-xs h-10 px-4 shrink-0 font-medium"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 min-h-10">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-subtle text-xs font-semibold text-brand-primary border border-border-strong"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-text-muted hover:text-feedback-error-text p-0.5 rounded"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-text-muted italic">
                  No skills added yet. Add relevant programming languages, frameworks, or domain skills.
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Professional Links */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-brand-primary uppercase tracking-wider pb-2 border-b border-border-subtle">
            4. Professional & Portfolio Links
          </h2>

          <div className="space-y-3">
            <div className="relative flex items-center">
              <Linkedin className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                disabled={isPending}
                className="pl-9 text-xs"
              />
            </div>

            <div className="relative flex items-center">
              <Github className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                disabled={isPending}
                className="pl-9 text-xs"
              />
            </div>

            <div className="relative flex items-center">
              <Globe className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.dev"
                disabled={isPending}
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-6 h-11 text-xs font-bold flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <span>Save Profile Changes</span>
          )}
        </Button>
      </div>
    </form>
  );
}
