import Link from "next/link";
import { careerServiceStore } from "@/lib/db/career-service-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Video,
  Target,
  Compass,
} from "lucide-react";

export default async function CareerServicesPage() {
  const services = await careerServiceStore.getActiveServices();

  const getServiceIcon = (category: string) => {
    switch (category) {
      case "resume_review":
        return <FileCheck className="h-6 w-6" />;
      case "mock_interview":
        return <Video className="h-6 w-6" />;
      case "career_strategy":
        return <Compass className="h-6 w-6" />;
      default:
        return <Target className="h-6 w-6" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold">
          <Sparkles className="h-3 w-3 mr-1 text-brand-accent" />
          Verified Corporate Mentorship & Advisory
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-primary tracking-tight">
          Career Advisory & 1-on-1 Consulting
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          Prepare for tier-1 engineering and corporate hiring with personalized guidance from senior engineering managers and corporate hiring leads across India.
        </p>
      </div>

      {/* Trust & Transparency Banner */}
      <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-2 text-brand-primary font-bold">
          <ShieldCheck className="h-4 w-4 text-brand-accent shrink-0" />
          <span>Our Professional Advisory Promise</span>
        </div>
        <p className="text-[11px] leading-relaxed text-center sm:text-left">
          Honest mentorship focused on skill benchmarking and portfolio optimization. We do not sell false placement guarantees.
        </p>
      </div>

      {/* Service Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {services.map((service) => (
          <Card
            key={service.id}
            className="border border-border-subtle bg-surface-card hover:border-border-strong hover:shadow-md transition-all rounded-xl flex flex-col justify-between overflow-hidden"
          >
            <CardContent className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header: Icon, Category, Price */}
                <div className="flex items-center justify-between gap-4">
                  <div className="p-3 rounded-lg bg-surface-subtle text-brand-accent border border-border-subtle">
                    {getServiceIcon(service.category)}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-brand-primary">
                      ₹{service.priceInr.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-text-muted block">One-time consultation</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-brand-primary">
                    {service.name}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium pt-1">
                  <Clock className="h-3.5 w-3.5 text-brand-accent" />
                  <span>Duration: ~{service.durationMinutes} Minutes Live 1-on-1 Session</span>
                </div>

                {/* Deliverables List */}
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block">
                    What You Receive:
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-secondary">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-feedback-success-text shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-border-subtle">
                <Link href={`/career-services/book/${service.slug}`} className="w-full block">
                  <Button className="w-full text-xs font-bold h-10 flex items-center justify-center gap-1.5">
                    <span>Book Advisory Session</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
