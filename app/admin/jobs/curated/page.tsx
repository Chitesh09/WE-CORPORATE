import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminCuratedJobsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Curated / Platform Jobs</h1>
          <p className="text-xs text-text-secondary mt-1">Direct creation and management of platform-curated verified opportunities.</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Create Curated Job
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xs text-text-muted">Direct curation tools will be fully wired during Phase 7 implementation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
