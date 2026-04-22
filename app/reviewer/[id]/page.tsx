"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import type { ArticleComment } from "@/types/article"

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), { ssr: false })

const STATUS_OPTIONS = [
  { value: "SUBMITTED",    label: "Terkirim",     cls: "text-blue-400 border-blue-700 bg-blue-900/30" },
  { value: "UNDER_REVIEW", label: "Ditinjau",     cls: "text-amber-400 border-amber-700 bg-amber-900/30" },
  { value: "REVISION",     label: "Perlu Revisi", cls: "text-orange-400 border-orange-700 bg-orange-900/30" },
  { value: "ACCEPTED",     label: "Diterima",     cls: "text-green-400 border-green-700 bg-green-900/30" },
  { value: "REJECTED",     label: "Ditolak",      cls: "text-red-400 border-red-700 bg-red-900/30" },
  { value: "DRAFT",        label: "Draft",        cls: "text-ocean-400 border-ocean-700 bg-ocean-900" },
]

interface Submission {
  id: number; title: string; author: string; affiliate: string
  correspondence: string; email: string; abstract: string
  introduction: string; methodology: string; results: string
  conclusion: string; references: string
  plagiasiUrl?: string; coverLetterUrl?: string; attachmentUrls?: string[]
  status: string; comments: ArticleComment[]
  submittedBy?: { name: string; email: string; role: string }
  createdAt: string; updatedAt: string
}

export default function ReviewerPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewerName, setReviewerName] = useState("Reviewer")
  const [comments, setComments] = useState<ArticleComment[]>([])
  const [pendingComment, setPendingComment] = useState<{ text: string; from: number; to: number } | null>(null)
  const [commentInput, setCommentInput] = useState("")
  const [savingComment, setSavingComment] = useState(false)
  const [status, setStatus] = useState("")
  const [reviewerNote, setReviewerNote] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusSaved, setStatusSaved] = useState(false)
  const [isPrivileged, setIsPrivileged] = useState(false)

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then(async r => {
        if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? "Error"); }
        return r.json()
      })
      .then((data: Submission) => {
        setArticle(data)
        setComments(data.comments ?? [])
        setStatus(data.status)
        setReviewerNote((data as unknown as { reviewerNote?: string }).reviewerNote ?? "")
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))

    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => { if (s?.user?.role === "ADMIN" || s?.user?.role === "SUPER_ADMIN") setIsPrivileged(true) })
  }, [id])

  const handleAddComment = useCallback((text: string, from: number, to: number) => {
    setPendingComment({ text, from, to })
    setCommentInput("")
  }, [])

  const saveComment = useCallback(async () => {
    if (!pendingComment || !commentInput.trim()) return
    setSavingComment(true)
    const newComment: ArticleComment = {
      id: `${Date.now()}`, selectionText: pendingComment.text,
      comment: commentInput.trim(), reviewerName,
      paragraphIndex: pendingComment.from, createdAt: Date.now(),
    }
    const updated = [...comments, newComment]
    setComments(updated)
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: updated }),
    })
    setPendingComment(null); setCommentInput(""); setSavingComment(false)
  }, [pendingComment, commentInput, comments, id, reviewerName])

  const deleteComment = useCallback(async (commentId: string) => {
    const updated = comments.filter(c => c.id !== commentId)
    setComments(updated)
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: updated }),
    })
  }, [comments, id])

  const saveStatusAndNote = useCallback(async () => {
    setSavingStatus(true)
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewerNote }),
    })
    setSavingStatus(false); setStatusSaved(true)
    setTimeout(() => setStatusSaved(false), 2000)
  }, [id, status, reviewerNote])

  if (loading) return (
    <div className="bg-ocean-950 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-ocean-600 border-t-ocean-300 animate-spin" />
    </div>
  )

  if (error || !article) return (
    <div className="bg-ocean-950 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-white font-semibold">{error || "Artikel tidak ditemukan"}</p>
        <a href="/dashboard" className="text-ocean-400 hover:text-gold-400 text-sm transition-colors">← Dashboard</a>
      </div>
    </div>
  )

  const currentStatus = STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0]

  return (
    <div className="bg-ocean-950 min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-ocean-900/90 backdrop-blur-sm border-b border-ocean-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/dashboard/reviewer" className="text-ocean-500 hover:text-white transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{article.title}</p>
              <p className="text-ocean-500 text-[10px]">{article.author} · #{article.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${currentStatus.cls}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content — 2/3 */}
          <div className="lg:col-span-2 space-y-4">

            {/* Meta */}
            <div className="bg-ocean-900/40 border border-ocean-800 rounded-xl p-5">
              <p className="text-[10px] text-ocean-500 uppercase tracking-widest mb-3 font-mono">Informasi Penulis</p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  ["Penulis", article.author],
                  ["Afiliasi", article.affiliate],
                  ["Korespondensi", article.correspondence],
                  ["Email", article.email],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ocean-500 text-xs mb-0.5">{k}</dt>
                    <dd className="text-white text-xs font-medium truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Abstract */}
            <ArticleSection title="Abstrak">
              <p className="text-ocean-300 text-sm leading-relaxed text-justify">{article.abstract}</p>
            </ArticleSection>

            {[
              { title: "1. Pendahuluan",       content: article.introduction },
              { title: "2. Metodologi",         content: article.methodology },
              { title: "3. Hasil dan Diskusi",  content: article.results },
              { title: "4. Kesimpulan",         content: article.conclusion },
              { title: "Referensi",             content: article.references },
            ].map(({ title, content }) => (
              <ArticleSection key={title} title={title}>
                <RichTextEditor value={content} readonly onAddComment={handleAddComment} />
              </ArticleSection>
            ))}

            {/* Attached files */}
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

              {/* Reviewer identity */}
              <div className="bg-ocean-900/40 border border-ocean-800 rounded-xl p-4 space-y-3">
                <p className="text-white font-semibold text-sm">Identitas Reviewer</p>
                <input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Nama Reviewer"
                  className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-lg text-sm text-white
                             placeholder:text-ocean-600 focus:outline-none focus:border-ocean-500" />
              </div>

              {/* Status & decision — admin only */}
              {isPrivileged && (
                <div className="bg-ocean-900/40 border border-ocean-700 rounded-xl p-4 space-y-3">
                  <p className="text-white font-semibold text-sm">Keputusan Editor</p>
                  <div className="space-y-2">
                    {STATUS_OPTIONS.filter(s => s.value !== "DRAFT").map((opt) => (
                      <label key={opt.value}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs font-medium
                          ${status === opt.value ? opt.cls : "border-ocean-800 text-ocean-500 hover:border-ocean-700"}`}>
                        <input type="radio" name="status" value={opt.value} checked={status === opt.value}
                          onChange={() => setStatus(opt.value)} className="accent-ocean-500" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-ocean-400">Catatan untuk Penulis</label>
                    <textarea value={reviewerNote} onChange={(e) => setReviewerNote(e.target.value)} rows={4}
                      placeholder="Masukan, saran revisi, atau alasan keputusan..."
                      className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-lg text-sm text-white
                                 placeholder:text-ocean-600 focus:outline-none focus:border-ocean-500 resize-none" />
                  </div>
                  <button onClick={saveStatusAndNote} disabled={savingStatus}
                    className="w-full py-2 rounded-lg bg-ocean-700 hover:bg-ocean-600 text-white text-sm font-medium transition-colors disabled:opacity-60">
                    {statusSaved ? "✓ Tersimpan" : savingStatus ? "Menyimpan..." : "Simpan Keputusan"}
                  </button>
                </div>
              )}

              {/* Comment input */}
              {pendingComment && (
                <div className="bg-gold-900/20 border border-gold-700/50 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] text-gold-500 uppercase tracking-widest font-mono">Komentar Baru</p>
                  <blockquote className="border-l-2 border-gold-500 pl-3 text-xs text-ocean-400 italic line-clamp-3">
                    "{pendingComment.text}"
                  </blockquote>
                  <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Tulis komentar..." rows={3}
                    className="w-full px-3 py-2 bg-ocean-950 border border-ocean-700 rounded-lg text-sm text-white
                               placeholder:text-ocean-600 focus:outline-none focus:border-ocean-500 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={saveComment} disabled={savingComment || !commentInput.trim()}
                      className="flex-1 py-1.5 rounded-lg bg-gold-500 text-ocean-950 text-xs font-bold hover:bg-gold-400 transition-colors disabled:opacity-50">
                      {savingComment ? "..." : "Simpan"}
                    </button>
                    <button onClick={() => setPendingComment(null)}
                      className="px-3 py-1.5 rounded-lg bg-ocean-800 text-ocean-400 text-xs hover:bg-ocean-700 transition-colors">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-ocean-400 text-xs font-medium">
                    Komentar {comments.length > 0 && <span className="text-white">({comments.length})</span>}
                  </p>
                </div>
                {comments.length === 0 ? (
                  <p className="text-ocean-700 text-xs text-center py-4">
                    Blok teks lalu klik "Tambah Komentar"
                  </p>
                ) : (
                  [...comments].reverse().map((c) => (
                    <div key={c.id} className="bg-ocean-900/50 border border-ocean-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ocean-300">{c.reviewerName}</span>
                        <button onClick={() => deleteComment(c.id)} className="text-ocean-700 hover:text-red-400 text-xs transition-colors">✕</button>
                      </div>
                      <blockquote className="border-l-2 border-ocean-600 pl-2 text-[11px] text-ocean-500 italic line-clamp-2">
                        "{c.selectionText}"
                      </blockquote>
                      <p className="text-sm text-white">{c.comment}</p>
                      <p className="text-[10px] text-ocean-700">
                        {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
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
    <div className="bg-ocean-900/30 border border-ocean-800 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600 flex-shrink-0" />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function FileChip({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-900 border border-ocean-700
                  hover:border-ocean-500 text-xs text-ocean-300 hover:text-white transition-all">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      {label}
    </a>
  )
}
