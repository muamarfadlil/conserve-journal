import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? "https://conservejournal.ac.id"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/articles/"],
        disallow: ["/dashboard/", "/submit", "/reviewer/", "/api/", "/login", "/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
