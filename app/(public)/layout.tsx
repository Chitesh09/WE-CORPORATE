import { getCurrentUser } from "@/lib/auth/session";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader user={user} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
