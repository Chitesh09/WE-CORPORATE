"use client";

import { useState, useTransition } from "react";
import { submitVerificationEvidenceAction } from "@/lib/actions/employer-actions";
import { CompanyRecord, VerificationSubmissionRecord } from "@/lib/db/employer-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Info,
} from "lucide-react";

interface VerificationFormProps {
  company: CompanyRecord;
  existingSubmission: VerificationSubmissionRecord | null;
}

export function VerificationForm({ company, existingSubmission }: VerificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [businessRegistrationType, setBusinessRegistrationType] = useState<
    VerificationSubmissionRecord["businessRegistrationType"]
  >(existingSubmission?.businessRegistrationType || "CIN");
  const [registrationNumber, setRegistrationNumber] = useState(
    existingSubmission?.registrationNumber || ""
  );
  const [officialWebsite, setOfficialWebsite] = useState(
    company.websiteUrl || `https://${company.corporateDomain}`
  );
  const [authorizationNote, setAuthorizationNote] = useState(
    existingSubmission?.authorizationNote || ""
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    existingSubmission?.documentFileName || null
  );

  const isVerified = company.verificationStatus === "verified";
  const isPendingReview = company.verificationStatus === "pending";

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5 MB limit. Please select a smaller document.");
      return;
    }

    setUploadedFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await submitVerificationEvidenceAction({
        businessRegistrationType,
        registrationNumber,
        officialWebsite,
        authorizationNote: authorizationNote || undefined,
        documentFileName: uploadedFileName || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Verification evidence submitted! Your company status is now Under Review.");
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

      {/* Top Status Card */}
      <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-brand-accent">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-brand-primary">Employer Trust Verification</h2>
                <p className="text-xs text-text-secondary">
                  Organization: <strong>{company.name}</strong> • Domain: <span className="font-mono">{company.corporateDomain}</span>
                </p>
              </div>
            </div>

            {isVerified ? (
              <Badge variant="verified" className="text-xs py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verified Partner
              </Badge>
            ) : isPendingReview ? (
              <Badge variant="warning" className="text-xs py-1 px-3">
                <Clock className="h-3.5 w-3.5 mr-1" /> Pending Admin Review
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs py-1 px-3 text-feedback-warning-text border-feedback-warning-text/40">
                <AlertCircle className="h-3.5 w-3.5 mr-1" /> Unverified
              </Badge>
            )}
          </div>

          <div className="p-3.5 rounded-md bg-feedback-info-bg/30 border border-feedback-info-text/20 text-xs text-feedback-info-text space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>Why Admin Verification is Required</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              To protect students and job seekers against fraudulent postings, recruitment fees, and phishing, all hiring partners must undergo corporate trust verification before publishing jobs or contacting applicants.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Verification Evidence Submission Form */}
      {isVerified ? (
        <Card className="border border-feedback-success-text/20 bg-feedback-success-bg/10 rounded-lg">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-feedback-success-text mx-auto" />
            <h3 className="text-base font-bold text-brand-primary">Company is Fully Verified</h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Your business credentials and corporate domain have been verified by the WE CORPORATE moderation team. Your organization is eligible to publish opportunities.
            </p>
            {existingSubmission && (
              <div className="pt-2 text-[11px] text-text-muted font-mono">
                {existingSubmission.businessRegistrationType}: {existingSubmission.registrationNumber}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border-subtle bg-surface-card rounded-lg shadow-sm">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-1 pb-4 border-b border-border-subtle">
              <h3 className="text-base font-bold text-brand-primary">Submit Verification Evidence</h3>
              <p className="text-xs text-text-secondary">
                Provide valid business registration details and proof of corporate authorization.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Business Registration Type */}
                <div className="space-y-1.5">
                  <label htmlFor="regType" className="text-xs font-semibold text-text-secondary">
                    Registration Type <span className="text-feedback-error-text">*</span>
                  </label>
                  <select
                    id="regType"
                    value={businessRegistrationType}
                    onChange={(e) =>
                      setBusinessRegistrationType(
                        e.target.value as VerificationSubmissionRecord["businessRegistrationType"]
                      )
                    }
                    disabled={isPending || isPendingReview}
                    className="w-full rounded-md border border-border-strong bg-surface-card p-2.5 text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                  >
                    <option value="CIN">CIN (Corporate Identification Number - Pvt Ltd / Ltd)</option>
                    <option value="GSTIN">GSTIN (Goods and Services Tax Identification Number)</option>
                    <option value="LLPIN">LLPIN (Limited Liability Partnership Number)</option>
                    <option value="Udyam">Udyam Registration (MSME)</option>
                    <option value="IncorporationCertificate">Certificate of Incorporation</option>
                    <option value="Other">Other Official Business Identifier</option>
                  </select>
                </div>

                {/* Registration Identifier */}
                <div className="space-y-1.5">
                  <label htmlFor="regNumber" className="text-xs font-semibold text-text-secondary">
                    Registration Identifier / Number <span className="text-feedback-error-text">*</span>
                  </label>
                  <Input
                    id="regNumber"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. U72900KA2013PTC072123"
                    required
                    disabled={isPending || isPendingReview}
                    className="font-mono text-xs uppercase"
                  />
                </div>

                {/* Official Corporate Website */}
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="officialWebsite" className="text-xs font-semibold text-text-secondary">
                    Official Corporate Website <span className="text-feedback-error-text">*</span>
                  </label>
                  <Input
                    id="officialWebsite"
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    placeholder="https://company.com"
                    required
                    disabled={isPending || isPendingReview}
                  />
                </div>
              </div>

              {/* Upload Document Proof */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary block">
                  Certificate / Proof Document <span className="text-text-muted font-normal">(PDF or Image, max 5 MB)</span>
                </label>
                <div className="p-4 rounded-lg border border-dashed border-border-strong bg-surface-subtle text-center space-y-2">
                  <Upload className="h-6 w-6 text-brand-accent mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-brand-primary">
                      {uploadedFileName ? `Attached: ${uploadedFileName}` : "Upload Business Registration Document"}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      GST Certificate, Incorporation Letter, or Official Authorization
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleSimulatedFileUpload}
                    disabled={isPending || isPendingReview}
                    className="text-xs text-text-muted file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-accent file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                </div>
              </div>

              {/* Authorization Note */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="authNote" className="text-xs font-semibold text-text-secondary">
                    Recruiter Authority Statement <span className="text-text-muted font-normal">(Optional)</span>
                  </label>
                  <span className="text-[11px] text-text-muted">{authorizationNote.length}/1000</span>
                </div>
                <textarea
                  id="authNote"
                  rows={3}
                  maxLength={1000}
                  value={authorizationNote}
                  onChange={(e) => setAuthorizationNote(e.target.value)}
                  placeholder="I am an authorized hiring manager / representative of this organization..."
                  disabled={isPending || isPendingReview}
                  className="w-full rounded-md border border-border-strong bg-surface-card p-3 text-xs text-brand-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-4 border-t border-border-subtle">
                <Button
                  type="submit"
                  disabled={isPending || isPendingReview || !registrationNumber.trim()}
                  className="text-xs font-semibold h-10 px-6 flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting for Review...</span>
                    </>
                  ) : isPendingReview ? (
                    <>
                      <Clock className="h-3.5 w-3.5" />
                      <span>Evidence Under Review</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Submit for Admin Approval</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
