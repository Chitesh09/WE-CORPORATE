import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Abuse & Moderation Reports</h1>
        <p className="text-xs text-text-secondary mt-1">Review flagged opportunities, user reports, and platform safety triggers.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-brand-primary">No open abuse reports</h3>
                <Badge variant="verified">Clean Queue</Badge>
              </div>
              <p className="text-xs text-text-muted mt-1">Zero reported fee-charging or fraudulent opportunities.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
