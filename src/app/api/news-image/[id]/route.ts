import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Liefert das (in der DB gespeicherte) Beitragsbild eines Aktuelles-Eintrags.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { id },
    select: { imageData: true, imageMime: true },
  });

  if (!post?.imageData) {
    return new Response("Kein Bild", { status: 404 });
  }

  const body = new Uint8Array(post.imageData);
  return new Response(body, {
    headers: {
      "Content-Type": post.imageMime ?? "image/jpeg",
      // Cache-Busting über ?v=… (updatedAt)
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
