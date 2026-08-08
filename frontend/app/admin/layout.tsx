import AdminLayout from "@/src/layouts/AdminLayout";
import AdminAuthGuard from "@/components/auth/AdminAuthGuard";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminAuthGuard>
  );
}