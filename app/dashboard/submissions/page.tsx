import type { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Artikel Saya" }

const STATUS_CONFIG = {
  DRAFT:        { label: "Draft",         cls: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-ocean-900 dark:text-ocean-400 dark:border-ocean-700",          dot: "bg-slate-400 dark:bg-ocean-500" },
  SUBMITTED:    { label: "Terkirim",      cls: "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700",             dot: "bg-blue-500 dark:bg-blue-400" },
  UNDER_REVIEW: { label: "Ditinjau",      cls: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700",       dot: "bg-amber-500 dark:bg-amber-400" },
  REVISION:     { label: "Perlu Revisi",  cls: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-700", dot: "bg-orange-500 dark:bg-orange-400" },
  ACCEPTED:     { label: "Diterima",      cls: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700",       dot: "bg-green-500 dark:bg-green-400" },
  REJECTED:     { label: "Ditolak",       cls: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700",                   dot: "bg-red-500 dark:bg-red-400" },
} as const

const STATUS_HELP: Record<string, string> = {
  DRAFT:        "Belum dikirim ke editor",
  SUBMITTED:    "Menunggu ditinjau oleh editor",
  UNDER_REVIEW: "Sedang dalam proses peninjauan",
  REVISION:     "Editor meminta revisi pada naskah Anda",
  ACCEPTED:     "Artikel diterima untuk dipublikasikan",
  REJECTED:     "Artikel tidak dapat diterima",
}

export default async function SubmissionsPage() {
  const session = await getSession().catch(() => null)
  if (!session) redirect("/login")

  let submissions: Array<{
    id: number; title: string; author: string; status: string
    createdAt: Date; updatedAt: Date; reviewerNote: string | null
  }> = []

  try {
    submissions = await prisma.submission.findMany({
      where: { submittedById: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, author: true, status: true, createdAt: true, updatedAt: true, reviewerNote: true },
    })
  } catch { /* DB offline */ }

  const hasPendingRevision = submissions.some(s => s.status === "REVISION")

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)]">Artikel Saya</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {submissions.length > 0
              ? `${submissions.length} artikel · ${submissions.filter(s => ["SUBMITTED", "UNDER_REVIEW"].includes(s.status)).length} dalam proses`
              : "Belum ada artikel yang disubmit"}
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500
                     hover:bg-gold-400 text-ocean-950 text-sm font-semibold
                     transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Baru
        </Link>
      </div>

      {/* Revision alert */}
      {hasPendingRevision && (
        <div className="flex items-start gap-3 p-4 rounded-xl
                        bg-orange-50 border border-orange-200
                        dark:bg-orange-900/20 dark:border-orange-800">
          <svg className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">Revisi Diperlukan</p>
            <p className="text-orange-600/80 dark:text-orange-400/70 text-xs mt-0.5">
              Satu atau lebih artikel membutuhkan revisi. Buka artikel dan perbarui sesuai catatan reviewer.
            </p>
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const cfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
            const help = STATUS_HELP[s.status] ?? ""
            const canEdit = ["DRAFT", "REVISION"].includes(s.status)
            return (
              <div
                key={s.id}
                className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5
                           hover:border-ocean-400 dark:hover:border-ocean-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Status row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono
                                        px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="text-[var(--text-muted)] text-[10px]">
                        #{String(s.id).padStart(3, "0")}
                      </span>
                      {help && (
                        <span className="text-[var(--text-muted)] text-[10px] hidden sm:inline">— {help}</span>
                      )}
                    </div>

                    <h3 className="text-[var(--text-primary)] font-semibold text-sm leading-snug line-clamp-2 mb-1">
                      {s.title}
                    </h3>
                    <p className="text-[var(--text-muted)] text-xs">{s.author}</p>

                    {/* Reviewer note (only for REVISION) */}
                    {s.status === "REVISION" && s.reviewerNote && (
                      <div className="mt-3 p-3 rounded-lg
                                      bg-orange-50 border border-orange-200
                                      dark:bg-orange-900/20 dark:border-orange-800/50">
                        <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-wider mb-1">
                          Catatan Reviewer
                        </p>
                        <p className="text-orange-700 dark:text-orange-300 text-xs leading-relaxed line-clamp-3">
                          {s.reviewerNote}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {/* Date */}
                    <div className="text-right hidden sm:block">
                      <p className="text-[var(--text-muted)] text-[10px]">Diperbarui</p>
                      <p className="text-[var(--text-secondary)] text-xs">
                        {new Date(s.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      {canEdit && (
                        <Link
                          href={`/submit?id=${s.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                                     font-medium transition-colors
                                     bg-ocean-600 hover:bg-ocean-500 text-white"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                      )}
                      <Link
                        href={`/reviewer/${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                                   transition-colors border
                                   bg-[var(--bg-surface-alt)] hover:bg-[var(--bg-surface)]
                                   border-[var(--border-default)] hover:border-ocean-400
                                   text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Detail
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
    <div className="text-center py-16 rounded-xl border border-dashed
                    bg-[var(--bg-surface-alt)] border-[var(--border-default)]">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                      bg-[var(--bg-surface)] border border-[var(--border-default)]">
        <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-[var(--text-primary)] font-medium text-sm mb-1">Belum ada artikel</h3>
      <p className="text-[var(--text-muted)] text-xs mb-5 max-w-xs mx-auto">
        Submit naskah artikel ilmiah Anda untuk memulai proses peninjauan.
      </p>
      <Link
        href="/submit"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500
                   hover:bg-gold-400 text-ocean-950 text-sm font-semibold transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Submit Artikel Pertama
      </Link>
    </div>
  )
}
