import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminEmployerQueuePage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Employer Verification Queue</h1>
        <p className="text-xs text-text-secondary mt-1">Review submitted company evidence to grant verified posting status.</p>
      </div>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-brand-primary">Acme Technologies Pvt Ltd</h3>
              <Badge variant="warning">Pending Review</Badge>
            </div>
            <p className="text-xs text-text-muted mt-1">Domain: acme.com • Submitted 3 hours ago</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="accent">Approve</Button>
            <Button size="sm" variant="outline">Request Info</Button>
            <Button size="sm" variant="destructive">Reject</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
