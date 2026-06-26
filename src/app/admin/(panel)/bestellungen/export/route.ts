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

  // Einzelbestellungen – nach Gericht gruppiert (alle Besteller je Menü zusammen)
  const groups = new Map<string, { name: string; note: string | null }[]>();
  for (const b of bookings) {
    const arr = groups.get(b.dishTitleSnapshot) ?? [];
    arr.push({ name: b.user.name, note: b.note });
    groups.set(b.dishTitleSnapshot, arr);
  }

  lines.push("Bestellungen nach Gericht");
  const sortedTitles = [...groups.keys()].sort((a, b) => a.localeCompare(b, "de"));
  for (const title of sortedTitles) {
    const people = groups
      .get(title)!
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
    lines.push("");
    lines.push([csvCell(title), csvCell(`${people.length} Bestellung(en)`)].join(";"));
    lines.push(["Name", "Sonderwunsch"].map(csvCell).join(";"));
    for (const p of people) {
      lines.push([csvCell(p.name), csvCell(p.note ?? "")].join(";"));
    }
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
