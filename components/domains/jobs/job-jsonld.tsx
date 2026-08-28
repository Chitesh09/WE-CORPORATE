import { PublicJob } from "@/lib/db/seed-data";

interface JobJsonLdProps {
  job: PublicJob;
}

export function JobJsonLd({ job }: JobJsonLdProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: job.company.name,
      value: job.id,
    },
    datePosted: job.publishedAt,
    employmentType:
      job.jobType === "full_time"
        ? "FULL_TIME"
        : job.jobType === "internship"
        ? "INTERN"
        : job.jobType === "part_time"
        ? "PART_TIME"
        : "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      sameAs: job.company.websiteUrl,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: job.state,
        addressCountry: "IN",
      },
    },
    jobLocationType: job.workplaceType === "remote" ? "TELECOMMUTE" : undefined,
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.minCompensation,
        maxValue: job.maxCompensation,
        unitText: job.compensationType === "monthly_stipend" ? "MONTH" : "YEAR",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
