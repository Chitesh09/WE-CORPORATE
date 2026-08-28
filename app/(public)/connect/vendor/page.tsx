import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2 } from "lucide-react";

export default function VendorConnectPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 rounded-full bg-surface-subtle text-brand-primary mb-2">
          <Building2 className="h-8 w-8 text-brand-accent" />
        </div>
        <h1 className="text-3xl font-bold text-brand-primary">Vendor Connect</h1>
        <p className="text-sm text-text-secondary">
          Collaborate with WE CORPORATE on HR technology, assessment tools, and corporate training programs.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 space-y-4">
          <h3 className="font-bold text-base text-brand-primary">Submit Vendor Partnership Proposal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Company / Vendor Name" />
            <Input placeholder="Contact Person Name" />
            <Input placeholder="Corporate Email" />
            <Input placeholder="Service Domain (e.g. Assessments, L&D)" />
          </div>
          <Button className="w-full sm:w-auto">Submit Proposal</Button>
        </CardContent>
      </Card>
    </div>
  );
}
