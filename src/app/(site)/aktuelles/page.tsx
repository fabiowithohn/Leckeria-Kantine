import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aktuelles" };

export default async function AktuellesPage() {
  const posts = await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const imaged = await prisma.newsPost.findMany({
    where: { published: true, NOT: { imageData: null } },
    select: { id: true },
  });
  const withImage = new Set(imaged.map((p) => p.id));

  return (
    <div className="py-16">
      <Container>
        <SectionHeading
          eyebrow="Neuigkeiten"
          title="Aktuelles von Leckeria"
          intro="Aktionen, neue Gerichte und Wissenswertes rund um unser Catering."
        />

        {posts.length === 0 ? (
          <p className="mt-12 text-ink-soft">Derzeit gibt es keine Beiträge.</p>
        ) : (
          <div className="mt-12 space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm"
              >
                {withImage.has(post.id) && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/api/news-image/${post.id}?v=${post.updatedAt.getTime()}`}
                    alt={post.title}
                    className="h-60 w-full object-cover sm:h-72"
                  />
                )}
                <div className="p-8">
                  <p className="text-sm font-medium text-brand-600">
                    {post.publishedAt.toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">{post.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-ink-soft">{post.body}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
