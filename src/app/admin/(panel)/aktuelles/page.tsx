import { prisma } from "@/lib/db";
import { NewsManager } from "@/components/admin/news-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aktuelles – Verwaltung" };

export default async function AdminAktuellesPage() {
  const posts = await prisma.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const imaged = await prisma.newsPost.findMany({
    where: { NOT: { imageData: null } },
    select: { id: true },
  });
  const withImage = new Set(imaged.map((p) => p.id));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Aktuelles</h1>
        <p className="mt-1 text-ink-soft">
          Beiträge für die Seite „Aktuelles“ verwalten. Entwürfe sind öffentlich
          nicht sichtbar.
        </p>
      </header>
      <NewsManager
        posts={posts.map((p) => ({
          id: p.id,
          title: p.title,
          body: p.body,
          published: p.published,
          publishedAt: p.publishedAt.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          hasImage: withImage.has(p.id),
          imageVersion: p.updatedAt.getTime().toString(),
        }))}
      />
    </div>
  );
}
