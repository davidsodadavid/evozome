import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

// Admin pages must always show live data (media in particular is fetched
// straight from R2 on every request).
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex w-full flex-1 flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
