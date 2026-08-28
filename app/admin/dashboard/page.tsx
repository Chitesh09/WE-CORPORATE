import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">Internal Operations & Moderation</h1>
        <p className="text-xs text-text-secondary mt-1">Operational queues for employer verification, job moderation, and partner CRM.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-text-muted">Pending Employers</span>
            <p className="text-2xl font-bold text-feedback-warning-text mt-1">4</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-text-muted">Pending Moderation</span>
            <p className="text-2xl font-bold text-brand-accent mt-1">7</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-text-muted">Consulting Requests</span>
            <p className="text-2xl font-bold text-brand-primary mt-1">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-text-muted">Open Inquiries</span>
            <p className="text-2xl font-bold text-text-secondary mt-1">5</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
