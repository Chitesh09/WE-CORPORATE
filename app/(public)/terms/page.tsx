import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-bold text-brand-primary">Terms of Service</h1>
      <p className="text-xs text-text-muted">Platform usage standards, employer covenants, and user responsibilities.</p>

      <Card>
        <CardContent className="p-8 space-y-4 text-sm text-text-secondary leading-relaxed">
          <p>
            Employers registering on WE CORPORATE covenant not to charge any application, registration, or placement fees to job seekers or student interns.
          </p>
          <p>
            All submitted job opportunities are subject to administrative moderation before public distribution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
