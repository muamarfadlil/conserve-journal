import type { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Artikel Saya" }

const STATUS_CONFIG = {
  DRAFT:        { label: "Draft",        cls: "bg-ocean-900 text-ocean-400 border-ocean-700" },
  SUBMITTED:    { label: "Terkirim",     cls: "bg-blue-900/40 text-blue-400 border-blue-700" },
  UNDER_REVIEW: { label: "Ditinjau",     cls: "bg-amber-900/40 text-amber-400 border-amber-700" },
  REVISION:     { label: "Perlu Revisi", cls: "bg-orange-900/40 text-orange-400 border-orange-700" },
  ACCEPTED:     { label: "Diterima",     cls: "bg-green-900/40 text-green-400 border-green-700" },
  REJECTED:     { label: "Ditolak",      cls: "bg-red-900/40 text-red-400 border-red-700" },
} as const

export default async function SubmissionsPage() {
  const session = await getSession().catch(() => null)
  if (!session) redirect("/login")

  let submissions: Array<{
    id: number; title: string; author: string; status: string
    createdAt: Date; updatedAt: Date
  }> = []

  try {
    submissions = await prisma.submission.findMany({
      where: { submittedById: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, author: true, status: true, createdAt: true, updatedAt: true },
    })
  } catch { /* DB offline */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">Artikel Saya</h1>
          <p className="text-ocean-400 text-sm mt-1">
            {submissions.length > 0
              ? `${submissions.length} artikel ditemukan`
              : "Belum ada artikel yang disubmit"}
          </p>
        </div>
        <Link href="/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ocean-700
                     hover:bg-ocean-600 text-white text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Baru
        </Link>
      </div>

      {submissions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const cfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
            return (
              <div key={s.id}
                className="bg-ocean-900/40 border border-ocean-800 rounded-xl p-5
                           hover:border-ocean-700 transition-all duration-200 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <span className="text-ocean-600 text-xs">#{s.id}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2
                                   group-hover:text-ocean-200 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-ocean-500 text-xs mt-1">{s.author}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-ocean-600 text-[10px]">Diperbarui</p>
                      <p className="text-ocean-400 text-xs">
                        {new Date(s.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Link href={`/submit?id=${s.id}`}
                        className="px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-ocean-300
                                   hover:text-white text-xs transition-colors border border-ocean-700">
                        Edit
                      </Link>
                      <Link href={`/reviewer/${s.id}`}
                        className="px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-ocean-300
                                   hover:text-white text-xs transition-colors border border-ocean-700">
                        Lihat
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-ocean-900/20 border border-dashed border-ocean-800 rounded-xl">
      <svg className="w-12 h-12 text-ocean-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-ocean-500 text-sm mb-4">Belum ada artikel yang disubmit</p>
      <Link href="/submit"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ocean-700
                   hover:bg-ocean-600 text-white text-sm font-medium transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Submit Artikel Pertama
      </Link>
    </div>
  )
}
