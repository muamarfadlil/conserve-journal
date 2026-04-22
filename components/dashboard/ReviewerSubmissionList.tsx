"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

const STATUS_CONFIG = {
  DRAFT:        { label: "Draft",    cls: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-ocean-900 dark:text-ocean-400 dark:border-ocean-700" },
  SUBMITTED:    { label: "Menunggu", cls: "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700" },
  UNDER_REVIEW: { label: "Ditinjau", cls: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700" },
  REVISION:     { label: "Revisi",   cls: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-700" },
  ACCEPTED:     { label: "Diterima", cls: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700" },
  REJECTED:     { label: "Ditolak",  cls: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700" },
} as const

type Submission = {
  id: number
  title: string
  author: string
  status: string
  updatedAt: Date | string
  submittedBy: { name: string; email: string }
  assignedReviewer: { name: string } | null
}

type Props = {
  submissions: Submission[]
  privileged: boolean
}

const STATUS_FILTER_OPTIONS = [
  { value: "all",          label: "Semua Status" },
  { value: "SUBMITTED",    label: "Menunggu" },
  { value: "UNDER_REVIEW", label: "Ditinjau" },
  { value: "REVISION",     label: "Revisi" },
  { value: "ACCEPTED",     label: "Diterima" },
  { value: "REJECTED",     label: "Ditolak" },
]

export default function ReviewerSubmissionList({ submissions, privileged }: Props) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchStatus = statusFilter === "all" || s.status === statusFilter
      const q = query.toLowerCase()
      const matchQuery = !q ||
        s.title.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.submittedBy.email.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [submissions, query, statusFilter])

  const waiting = submissions.filter(s => s.status === "SUBMITTED").length

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <h2 className="text-[var(--text-primary)] font-semibold flex items-center gap-2">
          Daftar Submission
          {waiting > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono
                             bg-blue-100 text-blue-600 border border-blue-300
                             dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700">
              {waiting} baru
            </span>
          )}
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-52">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari judul atau penulis…"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none
                         bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                         text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                         focus:border-ocean-400"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-xs focus:outline-none
                       bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                       text-[var(--text-primary)] focus:border-ocean-400"
          >
            {STATUS_FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed
                        bg-[var(--bg-surface-alt)] border-[var(--border-default)]">
          <p className="text-[var(--text-muted)] text-sm">
            {query || statusFilter !== "all"
              ? "Tidak ada submission yang cocok"
              : privileged ? "Belum ada submission masuk" : "Belum ada submission yang ditugaskan kepada Anda"}
          </p>
          {(query || statusFilter !== "all") && (
            <button
              onClick={() => { setQuery(""); setStatusFilter("all") }}
              className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
            >
              Reset filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const cfg = STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
            return (
              <Link
                key={s.id}
                href={`/reviewer/${s.id}`}
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group
                           bg-[var(--bg-surface)] border border-[var(--border-default)]
                           hover:border-ocean-400 dark:hover:border-ocean-600"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                text-xs font-bold font-mono transition-colors
                                bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                text-[var(--text-muted)] group-hover:border-ocean-400">
                  {String(s.id).padStart(3, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                    {s.assignedReviewer ? (
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        → {s.assignedReviewer.name}
                      </span>
                    ) : (
                      privileged && (
                        <span className="text-[10px] text-[var(--text-muted)] font-mono italic">
                          belum di-assign
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-[var(--text-primary)] text-sm font-medium line-clamp-1">
                    {s.title}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">
                    {s.author}
                    {privileged && ` · ${s.submittedBy.email}`}
                  </p>
                </div>
                <div className="text-right hidden sm:block flex-shrink-0">
                  <p className="text-[var(--text-muted)] text-[10px]">Diperbarui</p>
                  <p className="text-[var(--text-secondary)] text-xs">
                    {new Date(s.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short",
                    })}
                  </p>
                </div>
                <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] flex-shrink-0 transition-colors"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
          {filtered.length < submissions.length && (
            <p className="text-center text-[var(--text-muted)] text-xs pt-1">
              Menampilkan {filtered.length} dari {submissions.length} submission
            </p>
          )}
        </div>
      )}
    </div>
  )
}
