import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "https://conservejournal.ac.id"

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ]

  let articleRoutes: MetadataRoute.Sitemap = []
  try {
    const articles = await prisma.article.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    })
    articleRoutes = articles.map(a => ({
      url: `${base}/articles/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  } catch { /* DB unavailable at build time */ }

  return [...staticRoutes, ...articleRoutes]
}
