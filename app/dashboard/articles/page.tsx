// app/dashboard/articles/page.tsx
import type { Metadata } from "next"
import { getSession, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArticlesTable from "@/components/dashboard/ArticlesTable"

export const metadata: Metadata = { title: "Kelola Artikel" }

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getSession()
  if (!isAdmin(session?.user.role)) redirect("/dashboard")

  const page = Math.max(1, parseInt(searchParams.page ?? "1"))
  const limit = 10
  const skip = (page - 1) * limit

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      skip,
      take: limit,
      include: { volume: true, authors: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.count(),
  ])

  const volumes = await prisma.volume.findMany({ orderBy: { year: "desc" } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Kelola Artikel</h1>
          <p className="text-ocean-400 text-sm mt-1">
            Total <span className="text-white font-medium">{total}</span> artikel
          </p>
        </div>
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
