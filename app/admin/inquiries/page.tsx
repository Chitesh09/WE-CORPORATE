import { Metadata } from "next";
import { collegeStore } from "@/lib/db/college-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Users,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "College & Institutional Leads CRM | Admin Portal",
  description: "Manage institutional placement leads and partner inquiries.",
};

export default async function AdminInquiriesPage() {
  const partnerships = await collegeStore.getAllPartnerships();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">College & Institutional Leads CRM</h1>
          <p className="text-xs text-text-secondary mt-1">
            Review incoming campus placement partnership requests from accredited universities and TPOs.
          </p>
        </div>
        <Badge variant="verified" className="text-xs self-start sm:self-auto">
          {partnerships.length} Active Leads
        </Badge>
      </div>

      <div className="space-y-4">
        {partnerships.length === 0 ? (
          <Card className="border border-border-subtle bg-surface-card rounded-xl">
            <CardContent className="p-8 text-center text-xs text-text-muted">
              No institutional inquiries recorded yet.
            </CardContent>
          </Card>
        ) : (
          partnerships.map((item) => (
            <Card key={item.id} className="border border-border-subtle bg-surface-card rounded-xl shadow-xs">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info" className="text-[10px]">
                        Ref: {item.referenceCode}
                      </Badge>
                      <span className="text-[11px] text-text-muted">â€¢ {item.affiliationType}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-brand-primary">
                      {item.institutionName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                      <span className="font-semibold text-brand-primary">{item.tpoHeadName}</span>
                      <span>â€¢</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-brand-accent" />
                        {item.officialEmail}
                      </span>
                      <span>â€¢</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-brand-accent" />
                        {item.phoneNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <Badge
                      variant={
                        item.status === "partnered"
                          ? "verified"
                          : item.status === "reviewing"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-xs uppercase font-bold"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">Campus Location</span>
                    <span className="font-semibold text-brand-primary flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                      {item.city}, {item.state}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted block">Estimated Batch Size</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {item.estimatedBatchSize} Students
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-text-muted block">Received Date</span>
                    <span className="font-medium text-brand-primary flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {item.preferredHiringModes && item.preferredHiringModes.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Requested Placement Modes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.preferredHiringModes.map((mode) => (
                        <span
                          key={mode}
                          className="px-2.5 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-[11px] font-medium text-text-secondary"
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.comments && (
                  <p className="text-xs text-text-secondary italic bg-surface-card p-2.5 rounded-md border border-border-subtle">
                    &ldquo;{item.comments}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
