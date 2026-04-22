import type { Metadata } from "next"
import { getSession, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArticlesTable from "@/components/dashboard/ArticlesTable"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Kelola Artikel" }

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getSession().catch(() => null)
  if (!isAdmin(session?.user.role)) redirect("/dashboard")

  const page = Math.max(1, parseInt(searchParams.page ?? "1"))
  const limit = 10
  const skip = (page - 1) * limit

  let articles: Awaited<ReturnType<typeof prisma.article.findMany<{ include: { volume: true; authors: true } }>>> = []
  let total = 0
  let volumes: Awaited<ReturnType<typeof prisma.volume.findMany>> = []

  try {
    ;[articles, total, volumes] = await Promise.all([
      prisma.article.findMany({
        skip,
        take: limit,
        include: { volume: true, authors: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.article.count(),
      prisma.volume.findMany({ orderBy: { year: "desc" } }),
    ])
  } catch (e) {
    console.error("[articles page]", e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">Kelola Artikel</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Total <span className="text-[var(--text-primary)] font-medium">{total}</span> artikel
        </p>
      </div>

      <ArticlesTable
        articles={articles as Parameters<typeof ArticlesTable>[0]["articles"]}
        volumes={volumes}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  )
}
