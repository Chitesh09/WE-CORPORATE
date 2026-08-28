import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Search } from "lucide-react";

export default function JobNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="border border-border-strong text-center py-12 px-6 rounded-xl shadow-sm bg-surface-card">
        <CardContent className="space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-feedback-warning-bg text-feedback-warning-text">
            <AlertCircle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-brand-primary">Opportunity Unavailable</h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              This job or internship listing is either expired, paused by the employer, or no longer accepting applications.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/jobs">
              <Button className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-1.5" /> Explore Active Opportunities
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
