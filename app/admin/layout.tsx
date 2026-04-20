import AdminNav from "@/components/admin/AdminNav";

// Auth is enforced by middleware.ts — no redundant check here to avoid redirect loops
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-tbwr-black">
      <AdminNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
