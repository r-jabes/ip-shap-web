import { NextResponse } from "next/server";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { ordersToCsv, productsToCsv } from "@/lib/admin/csv";
import { kigaliDay } from "@/lib/admin/reports";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";
import { listOrdersDurable } from "@/lib/orders/durable";
import {
  exportCustomerData,
  parseCustomerPhone,
} from "@/lib/privacy/customer-data";

export const dynamic = "force-dynamic";

const MAX_DAYS = 365;

/** `/admin/export/orders?days=30` and `/admin/export/products` — spreadsheet downloads for the team. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { kind } = await params;
  const today = kigaliDay(new Date());

  if (kind === "customer") {
    if (!roleHasPermission(session.role, "admins:manage")) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    const phone = parseCustomerPhone(
      new URL(request.url).searchParams.get("phone") ?? "",
    );
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    const data = await exportCustomerData(phone);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="customer-data-${today}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  let csv: string;
  let filename: string;

  if (kind === "orders") {
    if (!roleHasPermission(session.role, "orders:manage")) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    const requested = Number(new URL(request.url).searchParams.get("days"));
    const days =
      Number.isInteger(requested) && requested > 0
        ? Math.min(requested, MAX_DAYS)
        : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const orders = await listOrdersDurable({ since, limit: 1000 });
    csv = ordersToCsv(orders);
    filename = `orders-last-${days}-days-${today}.csv`;
  } else if (kind === "products") {
    if (!roleHasPermission(session.role, "products:read")) {
      return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    }
    csv = productsToCsv(await adminListProductsDurable());
    filename = `products-${today}.csv`;
  } else {
    return NextResponse.json({ error: "Unknown export." }, { status: 404 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
