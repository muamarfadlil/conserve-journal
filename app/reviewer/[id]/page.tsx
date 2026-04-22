"use client"

import { useEffect, useState, useCallback } from "react"
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
  introduction: string; methodology: string; results: string
  conclusion: string; references: string
  plagiasiUrl?: string; coverLetterUrl?: string; attachmentUrls?: string[]
  status: string; comments: ArticleComment[]; reviewerNote?: string
  submittedBy?: { name: string; email: string; role: string }
  assignedReviewer?: { id: string; name: string; email: string } | null
  createdAt: string; updatedAt: string
}

interface SessionUser { id: string; name: string; role: string }

export default function ReviewerPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)

  const [comments, setComments] = useState<ArticleComment[]>([])
  const [pendingComment, setPendingComment] = useState<{ text: string; from: number; to: number } | null>(null)
  const [commentInput, setCommentInput] = useState("")
  const [savingComment, setSavingComment] = useState(false)

  const [status, setStatus] = useState("")
  const [reviewerNote, setReviewerNote] = useState("")
  const [assignedReviewerId, setAssignedReviewerId] = useState<string>("")
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [savingDecision, setSavingDecision] = useState(false)
  const [decisionSaved, setDecisionSaved] = useState(false)

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"
  const isReviewer = currentUser?.role === "REVIEWER" || isAdmin

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => { if (s?.user) setCurrentUser(s.user) })

    fetch(`/api/submissions/${id}`)
      .then(async r => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? "Error"); }
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

  const handleAddComment = useCallback((text: string, from: number, to: number) => {
    setPendingComment({ text, from, to })
    setCommentInput("")
  }, [])

  const saveComment = useCallback(async () => {
    if (!pendingComment || !commentInput.trim()) return
    setSavingComment(true)
    const newComment: ArticleComment = {
      id: `${Date.now()}`,
      selectionText: pendingComment.text,
      comment: commentInput.trim(),
      reviewerName: currentUser?.name ?? "Reviewer",
      paragraphIndex: pendingComment.from,
      createdAt: Date.now(),
    }
    const updated = [...comments, newComment]
    setComments(updated)
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: updated }),
    })
    setPendingComment(null); setCommentInput(""); setSavingComment(false)
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

  const saveDecision = useCallback(async () => {
    setSavingDecision(true)
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewerNote, assignedReviewerId: assignedReviewerId || null }),
    })
    setSavingDecision(false); setDecisionSaved(true)
    setTimeout(() => setDecisionSaved(false), 2500)
  }, [id, status, reviewerNote, assignedReviewerId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="w-8 h-8 rounded-full border-2 border-ocean-400 border-t-ocean-600 animate-spin" />
    </div>
  )

  if (error || !article) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="text-center space-y-3">
        <p className="text-[var(--text-primary)] font-semibold">{error || "Artikel tidak ditemukan"}</p>
        <a href="/dashboard/reviewer"
           className="text-[var(--text-muted)] hover:text-gold-500 dark:hover:text-gold-400 text-sm transition-colors">
          ← Kembali ke Reviewer
        </a>
      </div>
    </div>
  )

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status)

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b
                      bg-[var(--bg-surface-alt)]/90 backdrop-blur-sm border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/dashboard/reviewer"
              className="p-1.5 rounded-lg transition-colors flex-shrink-0
                         text-[var(--text-muted)] hover:text-[var(--text-primary)]
                         hover:bg-[var(--bg-surface)]">
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
          {currentStatus && (
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border flex-shrink-0 ${currentStatus.cls}`}>
              {currentStatus.label}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main viewer — 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-3 font-mono">
                Informasi Penulis
              </p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  ["Penulis", article.author],
                  ["Afiliasi", article.affiliate],
                  ["Korespondensi", article.correspondence],
                  ["Email", article.email],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[var(--text-muted)] text-[10px] mb-0.5">{k}</dt>
                    <dd className="text-[var(--text-primary)] text-xs font-medium truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ArticleSection title="Abstrak">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed text-justify">
                {article.abstract}
              </p>
            </ArticleSection>

            {[
              { title: "1. Pendahuluan",      content: article.introduction },
              { title: "2. Metodologi",        content: article.methodology },
              { title: "3. Hasil dan Diskusi", content: article.results },
              { title: "4. Kesimpulan",        content: article.conclusion },
              { title: "Referensi",            content: article.references },
            ].map(({ title, content }) => (
              <ArticleSection key={title} title={title}>
                <RichTextEditor value={content} readonly
                  onAddComment={isReviewer ? handleAddComment : undefined} />
              </ArticleSection>
            ))}

            {(article.plagiasiUrl || article.coverLetterUrl || (article.attachmentUrls?.length ?? 0) > 0) && (
              <ArticleSection title="File Terlampir">
                <div className="flex flex-wrap gap-2">
                  {article.plagiasiUrl && <FileChip label="Laporan Plagiasi" url={article.plagiasiUrl} />}
                  {article.coverLetterUrl && <FileChip label="Cover Letter" url={article.coverLetterUrl} />}
                  {article.attachmentUrls?.map((url, i) => (
                    <FileChip key={url} label={`Lampiran ${i + 1}`} url={url} />
                  ))}
                </div>
              </ArticleSection>
            )}
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-4">
            <div className="sticky top-20 space-y-4">

              {/* ADMIN: keputusan editor & assign reviewer */}
              {isAdmin && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-gold-400 to-gold-600" />
                    <p className="text-[var(--text-primary)] font-semibold text-sm">Keputusan Editor</p>
                  </div>

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

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
                      Catatan untuk Penulis
                    </p>
                    <textarea value={reviewerNote} onChange={e => setReviewerNote(e.target.value)} rows={4}
                      placeholder="Saran revisi, pertimbangan, atau alasan keputusan..."
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none
                                 bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                                 focus:border-ocean-400" />
                  </div>

                  <button onClick={saveDecision} disabled={savingDecision}
                    className="w-full py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-ocean-950
                               text-sm font-bold transition-colors disabled:opacity-60">
                    {decisionSaved ? "✓ Tersimpan" : savingDecision ? "Menyimpan..." : "Simpan Keputusan"}
                  </button>
                </div>
              )}

              {/* REVIEWER: catatan saja */}
              {!isAdmin && isReviewer && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
                    <p className="text-[var(--text-primary)] font-semibold text-sm">Catatan Review</p>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs">
                    Catatan Anda akan diteruskan ke editor untuk pengambilan keputusan.
                  </p>
                  <textarea value={reviewerNote} onChange={e => setReviewerNote(e.target.value)} rows={5}
                    placeholder="Tulis catatan, rekomendasi, atau temuan Anda..."
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none
                               bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                               text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                               focus:border-ocean-400" />
                  <button onClick={async () => {
                    setSavingDecision(true)
                    await fetch(`/api/submissions/${id}`, {
                      method: "PATCH", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ reviewerNote }),
                    })
                    setSavingDecision(false); setDecisionSaved(true)
                    setTimeout(() => setDecisionSaved(false), 2500)
                  }} disabled={savingDecision}
                    className="w-full py-2 rounded-lg bg-ocean-600 hover:bg-ocean-500 text-white
                               text-sm font-medium transition-colors disabled:opacity-60">
                    {decisionSaved ? "✓ Tersimpan" : "Simpan Catatan"}
                  </button>
                </div>
              )}

              {/* Comment input panel */}
              {isReviewer && pendingComment && (
                <div className="rounded-xl p-4 space-y-3
                                bg-gold-50 border border-gold-200
                                dark:bg-gold-900/20 dark:border-gold-700/50">
                  <p className="text-[10px] text-gold-600 dark:text-gold-500 uppercase tracking-widest font-mono">
                    Komentar Baru
                  </p>
                  <blockquote className="border-l-2 border-gold-400 pl-3 text-xs text-[var(--text-muted)] italic line-clamp-3">
                    &ldquo;{pendingComment.text}&rdquo;
                  </blockquote>
                  <textarea value={commentInput} onChange={e => setCommentInput(e.target.value)}
                    placeholder="Tulis komentar..." rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none
                               bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                               text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                               focus:border-ocean-400" />
                  <div className="flex gap-2">
                    <button onClick={saveComment} disabled={savingComment || !commentInput.trim()}
                      className="flex-1 py-1.5 rounded-lg bg-gold-500 text-ocean-950 text-xs
                                 font-bold hover:bg-gold-400 transition-colors disabled:opacity-50">
                      {savingComment ? "..." : "Simpan"}
                    </button>
                    <button onClick={() => setPendingComment(null)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-colors
                                 bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-2">
                <p className="text-[var(--text-muted)] text-xs font-medium flex items-center gap-2">
                  Komentar
                  {comments.length > 0 && (
                    <span className="text-[var(--text-primary)] font-mono">({comments.length})</span>
                  )}
                </p>
                {comments.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-xs text-center py-4 rounded-lg border border-dashed
                                bg-[var(--bg-surface-alt)] border-[var(--border-default)]">
                    {isReviewer ? "Blok teks lalu klik Tambah Komentar" : "Belum ada komentar"}
                  </p>
                ) : (
                  [...comments].reverse().map((c) => (
                    <div key={c.id}
                         className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">{c.reviewerName}</span>
                        {(isAdmin || currentUser?.name === c.reviewerName) && (
                          <button onClick={() => deleteComment(c.id)}
                            className="text-[var(--text-muted)] hover:text-red-500 text-xs transition-colors">✕</button>
                        )}
                      </div>
                      <blockquote className="border-l-2 border-[var(--border-default)] pl-2 text-[11px] text-[var(--text-muted)] italic line-clamp-2">
                        &ldquo;{c.selectionText}&rdquo;
                      </blockquote>
                      <p className="text-sm text-[var(--text-primary)]">{c.comment}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {new Date(c.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
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

function ArticleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600 flex-shrink-0" />
        <h2 className="text-[var(--text-primary)] font-semibold text-sm">{title}</h2>
      </div>
      {children}
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
