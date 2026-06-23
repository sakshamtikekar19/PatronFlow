import { AdminLayoutShell } from "@/components/layout/admin-layout";
import { requireSuperAdmin } from "@/lib/admin/guards";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperAdmin();

  return (
    <AdminLayoutShell userEmail={user.email}>{children}</AdminLayoutShell>
  );
}
