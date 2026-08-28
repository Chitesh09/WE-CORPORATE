import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-brand-primary">About WE CORPORATE</h1>
        <p className="text-base text-text-secondary leading-relaxed">
          WE CORPORATE is a high-trust professional job and internship portal built for students, graduates, and verified employers across India.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center gap-2 font-bold text-brand-primary">
            <ShieldCheck className="h-5 w-5 text-brand-accent" />
            <span>Our Trust & Moderation Standard</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            We actively minimize fraudulent, misleading, and low-quality opportunities through employer credential verification, listing moderation, and continuous quality audits.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
