import { jobStore } from "@/lib/db/job-store";
import { AdminModerationQueue } from "@/components/domains/admin/admin-moderation-queue";

export default async function AdminJobModerationPage() {
  const pendingJobs = await jobStore.getPendingModerationQueue();
  const auditLogs = await jobStore.getModerationAuditLogs();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
          Job Listing Moderation Queue
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Review, approve, or reject employer job and internship submissions prior to live portal publication.
        </p>
      </div>

      <AdminModerationQueue pendingJobs={pendingJobs} auditLogs={auditLogs} />
    </div>
  );
}
