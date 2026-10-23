import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin/session";
import { countAwaitingOrdersDurable } from "@/lib/orders/durable";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  let newOrderCount = 0;
  try {
    newOrderCount = await countAwaitingOrdersDurable();
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "admin_new_order_count_error",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }

  return (
    <AdminShell session={session} newOrderCount={newOrderCount}>
      {children}
    </AdminShell>
  );
}
