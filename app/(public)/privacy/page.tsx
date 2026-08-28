import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-bold text-brand-primary">Privacy Policy</h1>
      <p className="text-xs text-text-muted">Designed to support applicable privacy and data-protection requirements.</p>

      <Card>
        <CardContent className="p-8 space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>
            WE CORPORATE respects the privacy of candidates and employers. Candidate profile and resume documents are securely stored in private storage and made accessible strictly to authorized employers for listings the candidate actively applied to.
          </p>
          <p>
            Candidates retain full rights to self-serve data export and account erasure in their account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
