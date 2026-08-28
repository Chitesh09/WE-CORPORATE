import { notFound } from "next/navigation";
import { careerServiceStore } from "@/lib/db/career-service-store";
import { getCurrentUser } from "@/lib/auth/session";
import { candidateStore } from "@/lib/db/candidate-store";
import { ServiceBookingForm } from "@/components/domains/career/service-booking-form";

interface CareerServiceBookingPageProps {
  params: Promise<{ serviceSlug: string }>;
}

export default async function CareerServiceBookingPage({
  params,
}: CareerServiceBookingPageProps) {
  const { serviceSlug } = await params;
  const service = await careerServiceStore.getServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  const user = await getCurrentUser();
  const resumes = user && user.role === "candidate" ? await candidateStore.getResumes(user.id) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="pb-4 border-b border-border-subtle space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
          Consulting Session Request & Booking
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Provide your availability preferences and context for {service.name}.
        </p>
      </div>

      <ServiceBookingForm
        service={service}
        resumes={resumes}
        isCandidateSignedIn={user !== null && user.role === "candidate"}
      />
    </div>
  );
}
