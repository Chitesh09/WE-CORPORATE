import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminInquiriesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">College & Vendor Leads CRM</h1>
        <p className="text-xs text-text-secondary mt-1">Manage institutional and partner inquiry submissions.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-brand-primary">National Institute of Technology — Campus Placement Cell</h3>
                <Badge variant="info">College Connect</Badge>
              </div>
              <p className="text-xs text-text-muted mt-1">Contact: Dr. Sharma • 450 B.Tech batch students</p>
            </div>
            <Badge variant="warning">New</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
