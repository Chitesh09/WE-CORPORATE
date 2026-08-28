import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-canvas">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-brand-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-primary text-white">
            <Briefcase className="h-5 w-5 text-brand-accent" />
          </div>
          <span>WE CORPORATE</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
