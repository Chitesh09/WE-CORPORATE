import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react";

export default function CollegeConnectPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 rounded-full bg-surface-subtle text-brand-accent mb-2">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-brand-primary">College Connect</h1>
        <p className="text-sm text-text-secondary">
          Partner with WE CORPORATE for verified campus placement drives and structured internship pathways.
        </p>
      </div>

      <Card>
        <CardContent className="p-8 space-y-4">
          <h3 className="font-bold text-base text-brand-primary">Submit Institutional Partnership Inquiry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="College / University Name" />
            <Input placeholder="Placement Cell Officer Name" />
            <Input placeholder="Official Email (name@college.edu.in)" />
            <Input placeholder="Phone Number" />
          </div>
          <Button className="w-full sm:w-auto">Submit Inquiry</Button>
        </CardContent>
      </Card>
    </div>
  );
}
