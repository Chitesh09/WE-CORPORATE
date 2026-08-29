import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { employerStore } from "@/lib/db/employer-store";
import { EmployerSidebar } from "@/components/layout/employer-sidebar";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "employer") {
    redirect("/auth/login?callbackUrl=/e/dashboard");
  }

  const { company } = await employerStore.ensureEmployerFromSession(user);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-canvas text-text-primary">
      {/* Responsive Employer Sidebar with Mobile Hamburger */}
      <EmployerSidebar user={user} company={company} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
