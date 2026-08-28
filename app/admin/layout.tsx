import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-canvas">
      <aside className="w-full md:w-64 border-r border-border-subtle bg-surface-card p-4 space-y-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-base text-brand-primary pb-4 border-b border-border-subtle">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-primary text-white">
            <ShieldAlert className="h-4 w-4 text-feedback-warning-text" />
          </div>
          <span>WE Admin Staff</span>
        </Link>

        <nav className="space-y-1 text-xs font-medium text-text-secondary">
          {siteConfig.adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-surface-subtle hover:text-brand-primary transition-colors"
            >
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
