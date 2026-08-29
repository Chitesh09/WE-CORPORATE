import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { CandidateSidebar } from "@/components/layout/candidate-sidebar";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "candidate") {
    redirect("/auth/login?callbackUrl=/c/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-canvas text-text-primary">
      {/* Responsive Candidate Sidebar with Mobile Hamburger */}
      <CandidateSidebar user={user} />

      {/* Main Workspace Surface */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-6xl">
        {children}
      </main>
    </div>
  );
}
