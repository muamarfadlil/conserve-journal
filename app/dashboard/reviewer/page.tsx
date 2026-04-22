import type { Metadata } from "next"
import { getSession, isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Reviewer" }

const STATUS_CONFIG = {
  DRAFT:        { label: "Draft",        cls: "bg-ocean-900 text-ocean-400 border-ocean-700" },
  SUBMITTED:    { label: "Terkirim",     cls: "bg-blue-900/40 text-blue-400 border-blue-700" },
  UNDER_REVIEW: { label: "Ditinjau",     cls: "bg-amber-900/40 text-amber-400 border-amber-700" },
  REVISION:     { label: "Perlu Revisi", cls: "bg-orange-900/40 text-orange-400 border-orange-700" },
  ACCEPTED:     { label: "Diterima",     cls: "bg-green-900/40 text-green-400 border-green-700" },
  REJECTED:     { label: "Ditolak",      cls: "bg-red-900/40 text-red-400 border-red-700" },
} as const

const STATUS_ORDER = ["SUBMITTED", "UNDER_REVIEW", "REVISION", "DRAFT", "ACCEPTED", "REJECTED"]

export default async function ReviewerDashboardPage() {
  const session = await getSession().catch(() => null)
  if (!session || !isAdmin(session.user.role)) redirect("/dashboard?error=forbidden")

  let submissions: Array<{
    id: number; title: string; author: string; status: string
    createdAt: Date; updatedAt: Date
    submittedBy: { name: string; email: string }
  }> = []

  let counts = { total: 0, submitted: 0, under_review: 0, revision: 0, accepted: 0, rejected: 0 }

  try {
    const raw = await prisma.submission.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, title: true, author: true, status: true,
        createdAt: true, updatedAt: true,
        submittedBy: { select: { name: true, email: true } },
      },
    })

    submissions = raw.sort((a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    )

    counts = {
      total: raw.length,
      submitted: raw.filter(s => s.status === "SUBMITTED").length,
      under_review: raw.filter(s => s.status === "UNDER_REVIEW").length,
      revision: raw.filter(s => s.status === "REVISION").length,
      accepted: raw.filter(s => s.status === "ACCEPTED").length,
      rejected: raw.filter(s => s.status === "REJECTED").length,
    }
  } catch { /* DB offline */ }

  const statCards = [
    { label: "Total Masuk", value: counts.total, color: "text-ocean-400", bg: "bg-ocean-800" },
    { label: "Menunggu Review", value: counts.submitted, color: "text-blue-400", bg: "bg-blue-900/30" },
    { label: "Sedang Ditinjau", value: counts.under_review, color: "text-amber-400", bg: "bg-amber-900/30" },
    { label: "Diterima", value: counts.accepted, color: "text-green-400", bg: "bg-green-900/30" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Panel Reviewer</h1>
        <p className="text-ocean-400 text-sm mt-1">Tinjau dan berikan keputusan pada artikel yang masuk.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label}
            className="bg-ocean-900 border border-ocean-800 rounded-xl p-4
                       hover:border-ocean-700 hover:-translate-y-0.5 transition-all duration-200">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-2`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-ocean-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Submission list */}
      <div>
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          Daftar Submission
          {counts.submitted > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-900/50 text-blue-400 border border-blue-700 font-mono">
              {counts.submitted} baru
            </span>
          )}
        </h2>

        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-ocean-900/20 border border-dashed border-ocean-800 rounded-xl">
            <p className="text-ocean-500 text-sm">Belum ada submission masuk</p>
          </div>
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => {
              const cfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
              return (
                <Link key={s.id} href={`/reviewer/${s.id}`}
                  className="flex items-center gap-4 p-4 bg-ocean-900/40 border border-ocean-800
                             hover:border-ocean-600 hover:bg-ocean-900/70 rounded-xl
                             transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-lg bg-ocean-800 border border-ocean-700 flex items-center
                                  justify-center text-sm font-bold text-ocean-400 flex-shrink-0 font-mono
                                  group-hover:border-ocean-600 transition-colors">
                    {String(s.id).padStart(3, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-ocean-200 transition-colors">
                      {s.title}
                    </p>
                    <p className="text-ocean-500 text-xs mt-0.5">
                      {s.author} · {s.submittedBy.email}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <p className="text-ocean-600 text-[10px]">Diperbarui</p>
                    <p className="text-ocean-400 text-xs">
                      {new Date(s.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-ocean-700 group-hover:text-ocean-400 transition-colors flex-shrink-0"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
