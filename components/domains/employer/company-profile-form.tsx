"use client";

import { useState, useTransition } from "react";
import { updateCompanyProfileAction } from "@/lib/actions/employer-actions";
import { CompanyRecord } from "@/lib/db/employer-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

interface CompanyProfileFormProps {
  initialCompany: CompanyRecord;
}

export function CompanyProfileForm({ initialCompany }: CompanyProfileFormProps) {
  const [company, setCompany] = useState<CompanyRecord>(initialCompany);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(company.name);
  const [websiteUrl, setWebsiteUrl] = useState(company.websiteUrl || "");
  const [industry, setIndustry] = useState(company.industry);
  const [companySize, setCompanySize] = useState(company.companySize);
  const [headquartersCity, setHeadquartersCity] = useState(company.headquartersCity);
  const [headquartersState, setHeadquartersState] = useState(company.headquartersState || "Karnataka");
  const [about, setAbout] = useState(company.about);
  const [publicContactEmail, setPublicContactEmail] = useState(company.publicContactEmail || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateCompanyProfileAction({
        name,
        websiteUrl: websiteUrl || undefined,
        industry,
        companySize,
        headquartersCity,
        headquartersState,
        about,
        publicContactEmail: publicContactEmail || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setCompany(result.data);
        setSuccessMessage("Company profile updated successfully.");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
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

      <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-primary">Public Organization Details</h2>
              <p className="text-xs text-text-secondary">
                Information displayed to candidates on your verified company page and job listings.
              </p>
            </div>
            {company.verificationStatus === "verified" ? (
              <Badge variant="verified">Verified Partner</Badge>
            ) : (
              <Badge variant="warning">Verification Pending</Badge>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Company Legal / Trade Name */}
              <div className="space-y-1.5">
                <label htmlFor="companyName" className="text-xs font-semibold text-text-secondary">
                  Company Name <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="companyName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Razorpay Software Pvt Ltd"
                  required
                  disabled={isPending}
                />
              </div>

              {/* Verified Corporate Domain (Read Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">
                  Corporate Email Domain
                </label>
                <Input
                  value={company.corporateDomain}
                  disabled
                  className="bg-surface-subtle text-text-muted font-mono text-xs cursor-not-allowed"
                />
                <span className="text-[10px] text-text-muted block">
                  Domain tied to verified recruiter email.
                </span>
              </div>

              {/* Website URL */}
              <div className="space-y-1.5">
                <label htmlFor="websiteUrl" className="text-xs font-semibold text-text-secondary">
                  Official Website URL
                </label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://company.com"
                    disabled={isPending}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label htmlFor="industry" className="text-xs font-semibold text-text-secondary">
                  Primary Industry <span className="text-feedback-error-text">*</span>
                </label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Financial Technology / Software"
                  required
                  disabled={isPending}
                />
              </div>

              {/* Company Size */}
              <div className="space-y-1.5">
                <label htmlFor="companySize" className="text-xs font-semibold text-text-secondary">
                  Company Size <span className="text-feedback-error-text">*</span>
                </label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded-md border border-border-strong bg-surface-card p-2.5 text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                >
                  <option value="1-10 employees">1-10 employees (Early-stage Startup)</option>
                  <option value="10-50 employees">10-50 employees (Growth Stage)</option>
                  <option value="50-200 employees">50-200 employees (Mid-sized Business)</option>
                  <option value="200-1000 employees">200-1000 employees (Established Corporate)</option>
                  <option value="1000-5000 employees">1000-5000 employees (Large Enterprise)</option>
                  <option value="5000+ employees">5000+ employees (Multinational)</option>
                </select>
              </div>

              {/* Public Contact Email */}
              <div className="space-y-1.5">
                <label htmlFor="publicContactEmail" className="text-xs font-semibold text-text-secondary">
                  Public Careers / Inquiries Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
                  <Input
                    id="publicContactEmail"
                    value={publicContactEmail}
                    onChange={(e) => setPublicContactEmail(e.target.value)}
                    placeholder="careers@company.com"
                    disabled={isPending}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Headquarters City */}
              <div className="space-y-1.5">
                <label htmlFor="headquartersCity" className="text-xs font-semibold text-text-secondary">
                  Headquarters City <span className="text-feedback-error-text">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 h-4 w-4 text-text-muted pointer-events-none" />
                  <Input
                    id="headquartersCity"
                    value={headquartersCity}
                    onChange={(e) => setHeadquartersCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                    disabled={isPending}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Headquarters State */}
              <div className="space-y-1.5">
                <label htmlFor="headquartersState" className="text-xs font-semibold text-text-secondary">
                  State / Union Territory
                </label>
                <Input
                  id="headquartersState"
                  value={headquartersState}
                  onChange={(e) => setHeadquartersState(e.target.value)}
                  placeholder="e.g. Karnataka"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* About Organization */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="about" className="text-xs font-semibold text-text-secondary">
                  About Company / Culture Summary <span className="text-feedback-error-text">*</span>
                </label>
                <span className="text-[11px] text-text-muted">{about.length}/2000</span>
              </div>
              <textarea
                id="about"
                rows={4}
                maxLength={2000}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Describe your company mission, products, workplace culture, and what makes hiring at your team exceptional..."
                required
                disabled={isPending}
                className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus leading-relaxed"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
              <Button
                type="submit"
                disabled={isPending}
                className="text-xs font-semibold h-10 px-6 flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Company Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
