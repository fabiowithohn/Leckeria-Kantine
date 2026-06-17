import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { dbDateFromISO, todayBerlinISO } from "@/lib/time";

export const dynamic = "force-dynamic";

function csvCell(value: string): string {
  // Werte mit ; " oder Zeilenumbruch in Anführungszeichen setzen
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayBerlinISO();

  const bookings = await prisma.booking.findMany({
    where: { date: dbDateFromISO(date) },
    include: { user: true },
    orderBy: [{ dishTitleSnapshot: "asc" }, { user: { name: "asc" } }],
  });

  // Zusammenfassung
  const summary = new Map<string, number>();
  for (const b of bookings) {
    summary.set(b.dishTitleSnapshot, (summary.get(b.dishTitleSnapshot) ?? 0) + 1);
  }

  const lines: string[] = [];
  lines.push(`Bestellungen für ${date}`);
  lines.push("");
  lines.push("Zusammenfassung");
  lines.push(["Menü", "Anzahl"].map(csvCell).join(";"));
  for (const [title, count] of [...summary.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push([csvCell(title), String(count)].join(";"));
  }
  lines.push([csvCell("Gesamt"), String(bookings.length)].join(";"));
  lines.push("");
  lines.push("Einzelbestellungen");
  lines.push(["Name", "E-Mail", "Menü"].map(csvCell).join(";"));
  for (const b of bookings) {
    lines.push([csvCell(b.user.name), csvCell(b.user.email), csvCell(b.dishTitleSnapshot)].join(";"));
  }

  // UTF-8 BOM für korrekte Darstellung in Excel
  const csv = "﻿" + lines.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bestellungen-${date}.csv"`,
    },
  });
}
