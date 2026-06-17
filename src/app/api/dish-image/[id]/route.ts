import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Liefert das (in der DB gespeicherte) Vorschaubild eines Grenzebach-Gerichts.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const dish = await prisma.dish.findUnique({
    where: { id },
    select: { imageData: true, imageMime: true },
  });

  if (!dish?.imageData) {
    return new Response("Kein Bild", { status: 404 });
  }

  const body = new Uint8Array(dish.imageData);
  return new Response(body, {
    headers: {
      "Content-Type": dish.imageMime ?? "image/jpeg",
      // updatedAt-Cache-Busting passiert über Query-Param ?v=…
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
