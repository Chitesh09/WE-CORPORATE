"use client";

import { useState, useTransition } from "react";
import { CampusDrive } from "@/lib/data/campus-drives";
import { registerForCampusDriveAction } from "@/lib/actions/college-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
} from "lucide-react";

interface CampusDriveRegistrationModalProps {
  drive: CampusDrive;
  onClose: () => void;
}

export function CampusDriveRegistrationModal({ drive, onClose }: CampusDriveRegistrationModalProps) {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [registrantType, setRegistrantType] = useState<"student" | "tpo_institution">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const result = await registerForCampusDriveAction({
        driveId: drive.id,
        registrantType,
        fullName,
        email,
        collegeName,
        graduationYear,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      if (!result.success) {
        setStatusMessage({ type: "error", message: result.error });
      } else {
        setIsSubmitted(true);
        setStatusMessage({ type: "success", message: result.message || "Registration completed successfully!" });
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-xl bg-surface-card shadow-2xl border border-border-strong overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-subtle/50">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge variant="verified" className="text-[10px] gap-1">
                <GraduationCap className="h-3 w-3" /> Campus Drive Registration
              </Badge>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {drive.compensationRange}
              </span>
            </div>
            <h2 className="text-base font-bold text-brand-primary line-clamp-1">
              {drive.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-brand-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Drive Snapshot */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border-subtle space-y-1.5">
            <div className="flex items-center justify-between text-brand-primary font-semibold">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-brand-accent" />
                {drive.companyName}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <Calendar className="h-3 w-3" />
                {new Date(drive.driveDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Format: <strong>{drive.driveFormat}</strong> • Criteria: {drive.minCgpaCriteria}
            </p>
          </div>

          {/* Feedback */}
          {statusMessage && (
            <div
              role="alert"
              className={`p-3 rounded-md text-xs flex items-center gap-2 border ${
                statusMessage.type === "success"
                  ? "bg-feedback-success-bg text-feedback-success-text border-feedback-success-text/20"
                  : "bg-feedback-error-bg text-feedback-error-text border-feedback-error-text/20"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 font-bold" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.message}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-brand-primary">You are Registered!</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Assessment test link, syllabus, and company briefing pack have been scheduled for dispatch to <strong>{email}</strong> prior to drive commencement.
              </p>
              <Button onClick={onClose} className="text-xs h-9 px-6 font-bold mt-2">
                Done & Return
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="font-bold text-brand-primary block">I am Registering As:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "student", label: "Student / Candidate" },
                    { id: "tpo_institution", label: "College Placement Officer" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRegistrantType(t.id as "student" | "tpo_institution")}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                        registrantType === t.id
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-surface-card border-border-subtle text-text-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="regName" className="font-bold text-brand-primary">
                    Full Name <span className="text-feedback-error-text">*</span>
                  </label>
                  <Input
                    id="regName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="regEmail" className="font-bold text-brand-primary">
                    Email Address <span className="text-feedback-error-text">*</span>
                  </label>
                  <Input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu.in"
                    required
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="regCollege" className="font-bold text-brand-primary">
                    College / University <span className="text-feedback-error-text">*</span>
                  </label>
                  <Input
                    id="regCollege"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. NIT Karnataka"
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="regGradYear" className="font-bold text-brand-primary">
                    Graduation Batch <span className="text-feedback-error-text">*</span>
                  </label>
                  <select
                    id="regGradYear"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full h-9 rounded-md border border-border-strong bg-surface-card px-2.5 text-xs text-brand-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
                  >
                    <option value="2026">2026 Graduating Batch</option>
                    <option value="2025">2025 Graduating Batch</option>
                    <option value="2024">2024 (Immediate Joiner)</option>
                    <option value="2027">2027 (Pre-final Year)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="regPhone" className="font-bold text-brand-primary">
                  WhatsApp / Calling Number
                </label>
                <Input
                  id="regPhone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="text-xs h-9"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending || !fullName.trim() || !email.trim() || !collegeName.trim()}
                  className="w-full text-xs h-10 font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <span>Confirm Campus Drive Registration</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
