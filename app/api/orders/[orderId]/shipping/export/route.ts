import { NextResponse } from "next/server";
import { getOrderForUser } from "@/lib/data";
import { getPirateShipDefaultPackage } from "@/lib/shipping";
import { formatMoney } from "@/lib/utils";

const CSV_HEADERS = [
  "Order ID",
  "Recipient Name",
  "Email",
  "Address 1",
  "Address 2",
  "City",
  "State",
  "Zip",
  "Country",
  "Phone",
  "Weight Oz",
  "Length",
  "Width",
  "Height",
  "Order Total",
  "Shipping Paid",
];

function csvCell(value: string | number | null | undefined) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: { orderId: string } }
) {
  const order = await getOrderForUser(params.orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const packageDefaults = getPirateShipDefaultPackage();
  const row = [
    order.id,
    order.shipping_name,
    order.customer_email,
    order.shipping_address,
    "",
    order.shipping_city,
    order.shipping_state,
    order.shipping_zip,
    order.shipping_country ?? "US",
    "",
    packageDefaults.weightOz,
    packageDefaults.length,
    packageDefaults.width,
    packageDefaults.height,
    formatMoney(order.amount_total_cents),
    formatMoney(order.shipping_amount_cents),
  ];

  const csv = [
    CSV_HEADERS.map(csvCell).join(","),
    row.map(csvCell).join(","),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pirate-ship-order-${order.id.slice(0, 8)}.csv"`,
    },
  });
}
