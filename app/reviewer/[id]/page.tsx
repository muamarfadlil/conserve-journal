"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import type { ArticleComment } from "@/types/article"

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), { ssr: false })

const STATUS_OPTIONS = [
  { value: "SUBMITTED",    label: "Menunggu Review",  cls: "text-blue-600 border-blue-300 bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:bg-blue-900/30" },
  { value: "UNDER_REVIEW", label: "Sedang Ditinjau",  cls: "text-amber-700 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:bg-amber-900/30" },
  { value: "REVISION",     label: "Perlu Revisi",     cls: "text-orange-700 border-orange-300 bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:bg-orange-900/30" },
  { value: "ACCEPTED",     label: "Diterima",         cls: "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-900/30" },
  { value: "REJECTED",     label: "Ditolak",          cls: "text-red-700 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-900/30" },
]

interface Reviewer { id: string; name: string; email: string }

interface Submission {
  id: number; title: string; author: string; affiliate: string
  correspondence: string; email: string; abstract: string
  keywords: string[]
  introduction: string; methodology: string; results: string
  conclusion: string; references: string
  plagiasiUrl?: string; coverLetterUrl?: string; attachmentUrls?: string[]
  status: string; comments: ArticleComment[]; reviewerNote?: string
  submittedBy?: { name: string; email: string; role: string }
  assignedReviewer?: { id: string; name: string; email: string } | null
  createdAt: string; updatedAt: string
}

interface SessionUser { id: string; name: string; role: string }

type PendingComment = { text: string; from: number; to: number; section: string }

// ── Section label colours ─────────────────────────────────────────────────
const SECTION_COLOR: Record<string, string> = {
  "Abstrak":           "bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700",
  "Pendahuluan":       "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-700",
  "Metodologi":        "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
  "Hasil dan Diskusi": "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
  "Kesimpulan":        "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
  "Referensi":         "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600",
}

export default function ReviewerPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle]       = useState<Submission | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)

  const [comments, setComments]     = useState<ArticleComment[]>([])
  const [pendingComment, setPendingComment] = useState<PendingComment | null>(null)
  const [commentInput, setCommentInput]     = useState("")
  const [savingComment, setSavingComment]   = useState(false)
  const [commentError, setCommentError]     = useState("")

  const [status, setStatus]                 = useState("")
  const [reviewerNote, setReviewerNote]     = useState("")
  const [assignedReviewerId, setAssignedReviewerId] = useState("")
  const [reviewers, setReviewers]           = useState<Reviewer[]>([])
  const [savingDecision, setSavingDecision] = useState(false)
  const [decisionSaved, setDecisionSaved]   = useState(false)
  const [decisionError, setDecisionError]   = useState("")

  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const isAdmin    = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"
  const isReviewer = currentUser?.role === "REVIEWER" || isAdmin

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => { if (s?.user) setCurrentUser(s.user) })

    fetch(`/api/submissions/${id}`)
      .then(async r => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? "Gagal memuat artikel") }
        return r.json()
      })
      .then((data: Submission) => {
        setArticle(data)
        setComments(data.comments ?? [])
        setStatus(data.status)
        setReviewerNote(data.reviewerNote ?? "")
        setAssignedReviewerId(data.assignedReviewer?.id ?? "")
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!isAdmin) return
    fetch("/api/users/reviewers")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviewers(data) })
      .catch(() => {})
  }, [isAdmin])

  // ── Comment handlers ──────────────────────────────────────────────────────

  // Factory: returns an onAddComment callback tagged with a section name.
  // Called by both RichTextEditor (for RTE sections) and AbstractSection (plain text).
  const addCommentForSection = useCallback((section: string) =>
    (text: string, from: number, to: number) => {
      setPendingComment({ text, from, to, section })
      setCommentInput("")
      setCommentError("")
      // Focus the textarea in the next tick (after state update & re-render)
      setTimeout(() => commentInputRef.current?.focus(), 50)
    }, [])

  const saveComment = useCallback(async () => {
    if (!pendingComment || !commentInput.trim()) return
    setCommentError("")
    setSavingComment(true)
    const newComment: ArticleComment = {
      id: `${Date.now()}`,
      selectionText: pendingComment.text,
      comment:       commentInput.trim(),
      reviewerName:  currentUser?.name ?? "Reviewer",
      paragraphIndex: pendingComment.from,
      section:       pendingComment.section,
      createdAt:     Date.now(),
    }
    const updated = [...comments, newComment]
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: updated }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Gagal menyimpan komentar") }
      setComments(updated)
      setPendingComment(null)
      setCommentInput("")
    } catch (e) {
      setCommentError(e instanceof Error ? e.message : "Gagal menyimpan komentar")
    } finally {
      setSavingComment(false)
    }
  }, [pendingComment, commentInput, comments, id, currentUser])

  const deleteComment = useCallback(async (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId)
    setComments(updated)
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: updated }),
    })
  }, [comments, id])

  // ── Decision / note save ──────────────────────────────────────────────────
  const saveDecision = useCallback(async () => {
    setSavingDecision(true)
    setDecisionError("")
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewerNote,
          assignedReviewerId: assignedReviewerId || null,
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Gagal menyimpan") }
      setDecisionSaved(true)
      setTimeout(() => setDecisionSaved(false), 2500)
    } catch (e) {
      setDecisionError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSavingDecision(false)
    }
  }, [id, status, reviewerNote, assignedReviewerId])

  const saveReviewerNote = useCallback(async () => {
    setSavingDecision(true)
    setDecisionError("")
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerNote }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Gagal menyimpan") }
      setDecisionSaved(true)
      setTimeout(() => setDecisionSaved(false), 2500)
    } catch (e) {
      setDecisionError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSavingDecision(false)
    }
  }, [id, reviewerNote])

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="w-8 h-8 rounded-full border-2 border-ocean-400 border-t-transparent animate-spin" />
    </div>
  )

  if (error || !article) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-[var(--text-primary)] font-semibold">{error || "Artikel tidak ditemukan"}</p>
        <a href="/dashboard/reviewer"
           className="text-sm text-[var(--text-muted)] hover:text-ocean-500 transition-colors">
          ← Kembali ke Panel Reviewer
        </a>
      </div>
    </div>
  )

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status)
  const noteWords = reviewerNote.trim().split(/\s+/).filter(Boolean).length

  // Group comments by section for the badge count in article sections
  const commentsBySection = comments.reduce<Record<string, number>>((acc, c) => {
    const sec = c.section ?? "Umum"
    acc[sec] = (acc[sec] ?? 0) + 1
    return acc
  }, {})

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b
                      bg-[var(--bg-surface-alt)]/95 backdrop-blur-sm border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/dashboard/reviewer"
              className="p-1.5 rounded-lg transition-colors flex-shrink-0
                         text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <div className="min-w-0">
              <p className="text-[var(--text-primary)] text-sm font-semibold truncate">{article.title}</p>
              <p className="text-[var(--text-muted)] text-[10px] font-mono">
                #{article.id} · {article.author}
                {article.assignedReviewer && ` · Reviewer: ${article.assignedReviewer.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {comments.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full
                               bg-gold-100 text-gold-700 border border-gold-300
                               dark:bg-gold-900/30 dark:text-gold-400 dark:border-gold-700">
                {comments.length} komentar
              </span>
            )}
            {currentStatus && (
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${currentStatus.cls}`}>
                {currentStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Article viewer (2/3) ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Submission meta */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 space-y-4">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
                Informasi Submission
              </p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["Penulis",        article.author],
                  ["Afiliasi",       article.affiliate],
                  ["Korespondensi",  article.correspondence],
                  ["Email",          article.email],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[var(--text-muted)] text-[10px] mb-0.5">{k}</dt>
                    <dd className="text-[var(--text-primary)] text-xs font-medium break-words">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* Keywords */}
              {article.keywords?.length > 0 && (
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono mb-1.5">
                    Kata Kunci
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {article.keywords.map(k => (
                      <span key={k}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium
                                   bg-ocean-100 text-ocean-700 border border-ocean-200
                                   dark:bg-ocean-900/40 dark:text-ocean-300 dark:border-ocean-700">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-mono
                              pt-2 border-t border-[var(--border-default)]">
                <span>
                  Disubmit:{" "}
                  <span className="text-[var(--text-secondary)]">
                    {new Date(article.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </span>
                <span>
                  Diperbarui:{" "}
                  <span className="text-[var(--text-secondary)]">
                    {new Date(article.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </span>
              </div>
            </div>

            {/* ── Abstract (plain text with inline comment bar) ─────────── */}
            <ArticleSection
              title="Abstrak"
              commentCount={commentsBySection["Abstrak"]}
              onAddComment={isReviewer ? addCommentForSection("Abstrak") : undefined}
            >
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed text-justify select-text">
                {article.abstract}
              </p>
            </ArticleSection>

            {/* ── RTE sections (Pendahuluan … Referensi) ───────────────── */}
            {[
              { title: "Pendahuluan",      sectionKey: "Pendahuluan",       content: article.introduction },
              { title: "Metodologi",       sectionKey: "Metodologi",        content: article.methodology },
              { title: "Hasil dan Diskusi",sectionKey: "Hasil dan Diskusi", content: article.results },
              { title: "Kesimpulan",       sectionKey: "Kesimpulan",        content: article.conclusion },
              { title: "Referensi",        sectionKey: "Referensi",         content: article.references },
            ].map(({ title, sectionKey, content }) => (
              <ArticleSection key={title} title={title}
                commentCount={commentsBySection[sectionKey]}>
                <RichTextEditor
                  value={content}
                  readonly
                  onAddComment={isReviewer ? addCommentForSection(sectionKey) : undefined}
                />
              </ArticleSection>
            ))}

            {/* ── Attachments ──────────────────────────────────────────── */}
            {(article.plagiasiUrl || article.coverLetterUrl || (article.attachmentUrls?.length ?? 0) > 0) && (
              <ArticleSection title="File Terlampir">
                <div className="flex flex-wrap gap-2">
                  {article.plagiasiUrl    && <FileChip label="Laporan Plagiasi" url={article.plagiasiUrl} />}
                  {article.coverLetterUrl && <FileChip label="Cover Letter"     url={article.coverLetterUrl} />}
                  {article.attachmentUrls?.map((url, i) => (
                    <FileChip key={url} label={`Lampiran ${i + 1}`} url={url} />
                  ))}
                </div>
              </ArticleSection>
            )}
          </div>

          {/* ── Sidebar (1/3) ────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="sticky top-20 space-y-4">

              {/* ADMIN: keputusan editor & assign reviewer */}
              {isAdmin && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-gold-400 to-gold-600" />
                    <p className="text-[var(--text-primary)] font-semibold text-sm">Keputusan Editor</p>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">Status</p>
                    <div className="grid grid-cols-1 gap-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <label key={opt.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer
                                      transition-all text-xs font-medium
                                      ${status === opt.value
                                        ? opt.cls
                                        : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-ocean-400 hover:text-[var(--text-primary)]"
                                      }`}>
                          <input type="radio" name="status" value={opt.value}
                            checked={status === opt.value} onChange={() => setStatus(opt.value)}
                            className="accent-ocean-500 flex-shrink-0" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Assign reviewer */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
                      Tugaskan Reviewer
                    </p>
                    <select value={assignedReviewerId} onChange={e => setAssignedReviewerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none
                                 bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                 text-[var(--text-primary)] focus:border-ocean-400">
                      <option value="">— Belum ditugaskan —</option>
                      {reviewers.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Reviewer note */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
                        Catatan untuk Penulis
                      </p>
                      {noteWords > 0 && (
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{noteWords} kata</span>
                      )}
                    </div>
                    <textarea value={reviewerNote} onChange={e => setReviewerNote(e.target.value)} rows={4}
                      placeholder="Saran revisi, pertimbangan, atau alasan keputusan..."
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none
                                 bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                                 focus:border-ocean-400" />
                  </div>

                  {decisionError && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                      <span>⚠</span> {decisionError}
                    </p>
                  )}

                  <button onClick={saveDecision} disabled={savingDecision}
                    className="w-full py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-ocean-950
                               text-sm font-bold transition-colors disabled:opacity-60
                               flex items-center justify-center gap-2">
                    {savingDecision ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Menyimpan…
                      </>
                    ) : decisionSaved ? "✓ Keputusan Tersimpan" : "Simpan Keputusan"}
                  </button>
                </div>
              )}

              {/* REVIEWER (non-admin): catatan review saja */}
              {!isAdmin && isReviewer && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                    <p className="text-[var(--text-primary)] font-semibold text-sm">Catatan Review</p>
                  </div>

                  {/* Current status badge (read-only for reviewer) */}
                  {currentStatus && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${currentStatus.cls}`}>
                      <span className="font-mono">Status saat ini:</span>
                      <span className="font-semibold">{currentStatus.label}</span>
                    </div>
                  )}

                  <p className="text-[var(--text-muted)] text-xs">
                    Catatan ini akan diteruskan ke editor sebagai bahan pengambilan keputusan.
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--text-muted)]">Catatan</span>
                      {noteWords > 0 && (
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{noteWords} kata</span>
                      )}
                    </div>
                    <textarea value={reviewerNote} onChange={e => setReviewerNote(e.target.value)} rows={6}
                      placeholder="Tulis catatan, rekomendasi, dan temuan Anda secara rinci..."
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none
                                 bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                                 focus:border-ocean-400" />
                  </div>

                  {decisionError && (
                    <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                      <span>⚠</span> {decisionError}
                    </p>
                  )}

                  <button onClick={saveReviewerNote} disabled={savingDecision}
                    className="w-full py-2 rounded-lg bg-ocean-600 hover:bg-ocean-500 text-white
                               text-sm font-medium transition-colors disabled:opacity-60
                               flex items-center justify-center gap-2">
                    {savingDecision ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Menyimpan…
                      </>
                    ) : decisionSaved ? "✓ Catatan Tersimpan" : "Simpan Catatan"}
                  </button>
                </div>
              )}

              {/* ── Pending comment input ─────────────────────────────── */}
              {isReviewer && pendingComment && (
                <div className="rounded-xl p-4 space-y-3
                                bg-gold-50 border border-gold-200
                                dark:bg-gold-900/20 dark:border-gold-700/50 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gold-600 dark:text-gold-500 uppercase tracking-widest font-mono">
                      Komentar Baru
                    </p>
                    {pendingComment.section && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono
                                        ${SECTION_COLOR[pendingComment.section] ?? "bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-[var(--border-default)]"}`}>
                        {pendingComment.section}
                      </span>
                    )}
                  </div>
                  <blockquote className="border-l-2 border-gold-400 pl-3 text-xs text-[var(--text-muted)] italic line-clamp-3">
                    &ldquo;{pendingComment.text}&rdquo;
                  </blockquote>
                  <textarea
                    ref={commentInputRef}
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveComment() }}
                    placeholder="Tulis komentar… (Ctrl+Enter untuk simpan)"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none
                               bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                               text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                               focus:border-ocean-400"
                  />
                  {commentError && (
                    <p className="text-xs text-red-500 dark:text-red-400">⚠ {commentError}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={saveComment}
                      disabled={savingComment || !commentInput.trim()}
                      className="flex-1 py-1.5 rounded-lg bg-gold-500 text-ocean-950 text-xs
                                 font-bold hover:bg-gold-400 transition-colors disabled:opacity-50">
                      {savingComment ? "Menyimpan…" : "Simpan Komentar"}
                    </button>
                    <button onClick={() => { setPendingComment(null); setCommentError("") }}
                      className="px-3 py-1.5 rounded-lg text-xs transition-colors
                                 bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* ── Comments list ─────────────────────────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
                    Komentar
                  </p>
                  {comments.length > 0 && (
                    <span className="text-[var(--text-primary)] text-xs font-mono">
                      {comments.length}
                    </span>
                  )}
                </div>

                {comments.length === 0 ? (
                  <div className="text-center py-6 rounded-xl border border-dashed
                                  bg-[var(--bg-surface-alt)] border-[var(--border-default)]">
                    <svg className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 opacity-40"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-[var(--text-muted)] text-xs">
                      {isReviewer
                        ? "Pilih teks pada artikel lalu klik 💬 Komentar"
                        : "Belum ada komentar"}
                    </p>
                  </div>
                ) : (
                  [...comments].reverse().map((c) => (
                    <div key={c.id}
                         className="bg-[var(--bg-surface)] border border-[var(--border-default)]
                                    rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <span className="text-xs font-medium text-[var(--text-secondary)] block">
                            {c.reviewerName}
                          </span>
                          {c.section && (
                            <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full border font-mono
                                              ${SECTION_COLOR[c.section] ?? "bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border-[var(--border-default)]"}`}>
                              {c.section}
                            </span>
                          )}
                        </div>
                        {(isAdmin || currentUser?.name === c.reviewerName) && (
                          <button onClick={() => deleteComment(c.id)}
                            title="Hapus komentar"
                            className="text-[var(--text-muted)] hover:text-red-500 transition-colors
                                       p-0.5 rounded flex-shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <blockquote className="border-l-2 border-[var(--border-default)] pl-2
                                             text-[11px] text-[var(--text-muted)] italic line-clamp-2">
                        &ldquo;{c.selectionText}&rdquo;
                      </blockquote>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{c.comment}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">
                        {new Date(c.createdAt).toLocaleString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ArticleSection({
  title,
  children,
  commentCount,
  onAddComment,
}: {
  title: string
  children: React.ReactNode
  commentCount?: number
  onAddComment?: (text: string, from: number, to: number) => void
}) {
  // For plain-text sections (e.g. Abstrak), this bar is used directly.
  // For RTE sections, RichTextEditor renders its own comment bar internally.
  const handleBarComment = useCallback(() => {
    if (!onAddComment) return
    const sel = window.getSelection()
    const text = sel?.toString().trim()
    if (!text) return
    onAddComment(text, 0, 0)
    sel?.removeAllRanges()
  }, [onAddComment])

  // Determine if children contains a RichTextEditor (by checking child type)
  // For RTE sections, we don't show the bar here since RTE has its own.
  // We detect this by checking if the child is from RTE or plain.
  // Simple heuristic: if children is a <p> (string content), show the bar.
  const isPlainText = typeof (children as React.ReactElement)?.type === "string"
    || (children as React.ReactElement)?.type === "p"

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border-default)]">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600 flex-shrink-0" />
        <h2 className="text-[var(--text-primary)] font-semibold text-sm flex-1">{title}</h2>
        {commentCount !== undefined && commentCount > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full
                           bg-gold-100 text-gold-700 border border-gold-300
                           dark:bg-gold-900/30 dark:text-gold-400 dark:border-gold-700">
            {commentCount} komentar
          </span>
        )}
      </div>

      {/* Comment bar — only for plain-text sections (Abstract) */}
      {isPlainText && onAddComment && (
        <div className="flex items-center gap-2 px-5 py-2
                        bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
          <svg className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] text-[var(--text-muted)] flex-1">
            Pilih teks lalu klik untuk menambah komentar
          </span>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleBarComment() }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg
                       bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400
                       hover:bg-gold-500/20 transition-colors flex-shrink-0">
            💬 Komentar
          </button>
        </div>
      )}

      <div className="p-5">{children}</div>
    </div>
  )
}

function FileChip({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all
                  bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                  text-[var(--text-secondary)] hover:border-ocean-400 hover:text-[var(--text-primary)]">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      {label}
    </a>
  )
}
