"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { db } from "@/lib/db"
import type { ArticleDraft, ArticleComment } from "@/types/article"

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), { ssr: false })

export default function ReviewerPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<ArticleDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewerName, setReviewerName] = useState("Reviewer")
  const [comments, setComments] = useState<ArticleComment[]>([])
  const [pendingComment, setPendingComment] = useState<{ text: string; from: number; to: number } | null>(null)
  const [commentInput, setCommentInput] = useState("")
  const [savingComment, setSavingComment] = useState(false)

  useEffect(() => {
    db.drafts.get(Number(id)).then((a) => {
      if (a) { setArticle(a); setComments(a.comments ?? []) }
      setLoading(false)
    })
  }, [id])

  const handleAddComment = useCallback((text: string, from: number, to: number) => {
    setPendingComment({ text, from, to })
    setCommentInput("")
  }, [])

  const saveComment = useCallback(async () => {
    if (!pendingComment || !commentInput.trim() || !article) return
    setSavingComment(true)

    const newComment: ArticleComment = {
      id: `${Date.now()}`,
      selectionText: pendingComment.text,
      comment: commentInput.trim(),
      reviewerName,
      paragraphIndex: pendingComment.from,
      createdAt: Date.now(),
    }

    const updated = [...comments, newComment]
    setComments(updated)
    await db.drafts.update(Number(id), { comments: updated, updatedAt: Date.now() })

    setPendingComment(null)
    setCommentInput("")
    setSavingComment(false)
  }, [pendingComment, commentInput, comments, id, article, reviewerName])

  const deleteComment = useCallback(async (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId)
    setComments(updated)
    await db.drafts.update(Number(id), { comments: updated, updatedAt: Date.now() })
  }, [comments, id])

  if (loading) {
    return (
      <div className="bg-ocean-950 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-ocean-600 border-t-ocean-300 animate-spin" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="bg-ocean-950 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-white font-semibold">Artikel tidak ditemukan</p>
          <a href="/submit" className="text-ocean-400 hover:text-gold-400 text-sm transition-colors">← Kembali ke Submit</a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ocean-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-mono text-ocean-500 uppercase tracking-widest mb-1">Mode Reviewer</p>
            <h1 className="text-2xl font-serif font-bold text-white line-clamp-2">{article.title}</h1>
            <p className="text-ocean-400 text-sm mt-1">{article.author} · {article.affiliate}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Nama Reviewer"
              className="px-3 py-1.5 rounded-lg bg-ocean-900 border border-ocean-700 text-sm text-white
                         placeholder:text-ocean-600 focus:outline-none focus:border-ocean-500 w-40"
            />
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${
              article.status === "submitted"
                ? "bg-gold-900/30 text-gold-400 border-gold-700"
                : article.status === "reviewed"
                ? "bg-green-900/30 text-green-400 border-green-700"
                : "bg-ocean-900 text-ocean-500 border-ocean-700"
            }`}>
              {article.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Viewer — 2/3 width */}
          <div className="lg:col-span-2 space-y-5">

            {/* Meta card */}
            <div className="bg-ocean-900/50 border border-ocean-800 rounded-xl p-5">
              <p className="text-[10px] text-ocean-500 uppercase tracking-widest mb-3">Informasi Artikel</p>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["Penulis", article.author],
                  ["Afiliasi", article.affiliate],
                  ["Email", article.email],
                  ["Korespondensi", article.correspondence],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ocean-500 text-xs">{k}</dt>
                    <dd className="text-white font-medium truncate">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Abstract */}
            <ArticleSection title="Abstrak">
              <p className="text-ocean-300 text-sm leading-relaxed text-justify">{article.abstract}</p>
            </ArticleSection>

            {/* Rich text sections in read-only mode */}
            {[
              { title: "1. Pendahuluan", content: article.introduction },
              { title: "2. Metodologi", content: article.methodology },
              { title: "3. Hasil dan Diskusi", content: article.results },
              { title: "4. Kesimpulan", content: article.conclusion },
              { title: "Referensi", content: article.references },
            ].map(({ title, content }) => (
              <ArticleSection key={title} title={title}>
                <RichTextEditor
                  value={content}
                  readonly
                  onAddComment={handleAddComment}
                />
              </ArticleSection>
            ))}

            {/* File attachments */}
            {(article.plagiasiFile || article.coverLetterFile || (article.attachments?.length ?? 0) > 0) && (
              <ArticleSection title="File Terlampir">
                <div className="space-y-2">
                  {article.plagiasiFile && (
                    <FileChip label="Laporan Plagiasi" url={article.plagiasiFile} />
                  )}
                  {article.coverLetterFile && (
                    <FileChip label="Cover Letter" url={article.coverLetterFile} />
                  )}
                  {article.attachments?.map((url, i) => (
                    <FileChip key={url} label={`Lampiran ${i + 1}`} url={url} />
                  ))}
                </div>
              </ArticleSection>
            )}
          </div>

          {/* Comments panel — 1/3 width */}
          <div className="space-y-4">
            <div className="sticky top-4 space-y-4">
              <div className="bg-ocean-900/50 border border-ocean-800 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-1">Panel Komentar</p>
                <p className="text-ocean-500 text-xs">Blok teks di editor lalu klik "Tambah Komentar"</p>
              </div>

              {/* Pending comment form */}
              {pendingComment && (
                <div className="bg-gold-900/20 border border-gold-700/50 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] text-gold-500 uppercase tracking-widest">Komentar Baru</p>
                  <blockquote className="border-l-2 border-gold-500 pl-3 text-xs text-ocean-300 italic line-clamp-3">
                    "{pendingComment.text}"
                  </blockquote>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Tulis komentar Anda..."
                    rows={3}
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-3 py-2
                               text-sm text-white placeholder:text-ocean-600 focus:outline-none
                               focus:border-ocean-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveComment} disabled={savingComment || !commentInput.trim()}
                      className="flex-1 py-1.5 rounded-lg bg-gold-500 text-ocean-950 text-xs font-bold
                                 hover:bg-gold-400 transition-colors disabled:opacity-50">
                      {savingComment ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button onClick={() => setPendingComment(null)}
                      className="px-3 py-1.5 rounded-lg bg-ocean-800 text-ocean-400 text-xs hover:bg-ocean-700 transition-colors">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Comment list */}
              {comments.length === 0 && !pendingComment ? (
                <div className="text-center py-8 text-ocean-600 text-sm">
                  Belum ada komentar
                </div>
              ) : (
                <div className="space-y-3">
                  {[...comments].reverse().map((c) => (
                    <div key={c.id} className="bg-ocean-900/60 border border-ocean-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-ocean-300">{c.reviewerName}</span>
                        <button onClick={() => deleteComment(c.id)}
                          className="text-ocean-700 hover:text-red-400 transition-colors text-xs">✕</button>
                      </div>
                      <blockquote className="border-l-2 border-ocean-600 pl-2 text-[11px] text-ocean-500 italic line-clamp-2">
                        "{c.selectionText}"
                      </blockquote>
                      <p className="text-sm text-white leading-relaxed">{c.comment}</p>
                      <p className="text-[10px] text-ocean-600">
                        {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600" />
        <h2 className="text-white font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function FileChip({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ocean-900
                  border border-ocean-700 hover:border-ocean-500 text-sm text-ocean-300
                  hover:text-white transition-all duration-200">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      {label}
    </a>
  )
}
