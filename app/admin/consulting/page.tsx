import { careerServiceStore } from "@/lib/db/career-service-store";
import { AdminConsultingManager } from "@/components/domains/admin/admin-consulting-manager";

export default async function AdminConsultingPage() {
  const orders = await careerServiceStore.getAllOrdersForAdmin();
  const consultants = await careerServiceStore.getActiveConsultants();
  const auditLogs = await careerServiceStore.getAuditLogs();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="pb-6 border-b border-border-subtle space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">
          Consulting Orders & Fulfillment Console
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Review candidate availability intake, assign active corporate advisors, confirm meeting slots, and track delivery.
        </p>
      </div>

      <AdminConsultingManager
        orders={orders}
        consultants={consultants}
        auditLogs={auditLogs}
      />
    </div>
  );
}
