"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Author = { id: number; name: string; affiliation: string | null; email: string | null }
type Volume = { id: number; number: number; issue: number; year: number; month: string | null }
type Article = {
  id: number
  title: string
  category: string | null
  pages: string | null
  doi: string | null
  pdfUrl: string | null
  abstract: string
  keywords: string[]
  publishedAt: Date | null
  volumeId: number
  volume: Volume
  authors: Author[]
}

type ArticlesTableProps = {
  articles: Article[]
  volumes: Volume[]
  total: number
  page: number
  limit: number
}

const CATEGORIES = ["Pendidikan", "Kelautan", "Lingkungan", "Ekonomi", "Konservasi", "Kesehatan", "Lainnya"]

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-ocean-900 border border-ocean-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-ocean-800">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-ocean-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}

type ArticleForm = {
  title: string
  abstract: string
  doi: string
  pdfUrl: string
  pages: string
  category: string
  keywords: string
  publishedAt: string
  volumeId: number
  authors: { name: string; affiliation: string; email: string }[]
}

function emptyForm(volumeId?: number): ArticleForm {
  return {
    title: "",
    abstract: "",
    doi: "",
    pdfUrl: "",
    pages: "",
    category: "",
    keywords: "",
    publishedAt: "",
    volumeId: volumeId ?? 0,
    authors: [{ name: "", affiliation: "", email: "" }],
  }
}

function articleToForm(a: Article): ArticleForm {
  return {
    title: a.title,
    abstract: a.abstract,
    doi: a.doi ?? "",
    pdfUrl: a.pdfUrl ?? "",
    pages: a.pages ?? "",
    category: a.category ?? "",
    keywords: a.keywords.join(", "),
    publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString().split("T")[0] : "",
    volumeId: a.volumeId,
    authors: a.authors.map((au) => ({
      name: au.name,
      affiliation: au.affiliation ?? "",
      email: au.email ?? "",
    })),
  }
}

function formToPayload(f: ArticleForm) {
  return {
    title: f.title,
    abstract: f.abstract,
    doi: f.doi || null,
    pdfUrl: f.pdfUrl || null,
    pages: f.pages || null,
    category: f.category || null,
    keywords: f.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    publishedAt: f.publishedAt || null,
    volumeId: Number(f.volumeId),
    authors: f.authors.filter((a) => a.name.trim()),
  }
}

export default function ArticlesTable({ articles, volumes, total, page, limit }: ArticlesTableProps) {
  const router = useRouter()
  const [formModal, setFormModal] = useState<{ open: boolean; article: Article | null }>({
    open: false,
    article: null,
  })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; article: Article | null }>({
    open: false,
    article: null,
  })
  const [form, setForm] = useState<ArticleForm>(emptyForm(volumes[0]?.id))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const totalPages = Math.ceil(total / limit)

  function openCreate() {
    setForm(emptyForm(volumes[0]?.id))
    setError("")
    setFormModal({ open: true, article: null })
  }

  function openEdit(article: Article) {
    setForm(articleToForm(article))
    setError("")
    setFormModal({ open: true, article })
  }

  function addAuthor() {
    setForm((f) => ({ ...f, authors: [...f.authors, { name: "", affiliation: "", email: "" }] }))
  }

  function removeAuthor(i: number) {
    setForm((f) => ({ ...f, authors: f.authors.filter((_, idx) => idx !== i) }))
  }

  function updateAuthor(i: number, field: keyof ArticleForm["authors"][0], value: string) {
    setForm((f) => {
      const authors = [...f.authors]
      authors[i] = { ...authors[i], [field]: value }
      return { ...f, authors }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const payload = formToPayload(form)
    const isEdit = !!formModal.article

    const res = await fetch(
      `/api/dashboard/articles${isEdit ? `?id=${formModal.article!.id}` : ""}`,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? "Terjadi kesalahan")
      return
    }

    setFormModal({ open: false, article: null })
    router.refresh()
  }

  async function handleDelete() {
    if (!deleteModal.article) return
    setLoading(true)
    const res = await fetch(`/api/dashboard/articles?id=${deleteModal.article.id}`, {
      method: "DELETE",
    })
    setLoading(false)
    if (res.ok) {
      setDeleteModal({ open: false, article: null })
      router.refresh()
    }
  }

  const inputCls =
    "w-full px-3 py-2 bg-ocean-800 border border-ocean-700 rounded-lg text-white text-sm placeholder-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-colors"
  const labelCls = "block text-xs text-ocean-400 mb-1"

  return (
    <>
      {/* Toolbar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-ocean-950 text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Artikel
        </button>
      </div>

      {/* Table */}
      <div className="bg-ocean-900 border border-ocean-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ocean-800">
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider">Judul</th>
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Volume</th>
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Penulis</th>
                <th className="text-right px-4 py-3 text-ocean-400 font-medium text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-800">
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ocean-500">
                    Belum ada artikel.
                  </td>
                </tr>
              )}
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-ocean-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium line-clamp-2 max-w-xs">{article.title}</p>
                    {article.doi && (
                      <p className="text-ocean-600 text-xs mt-0.5">DOI: {article.doi}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ocean-400 whitespace-nowrap">
                    Vol {article.volume.number} No {article.volume.issue} ({article.volume.year})
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {article.category && (
                      <span className="px-2 py-0.5 bg-ocean-800 text-ocean-300 text-xs rounded-full">
                        {article.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-ocean-400 text-xs">
                    {article.authors.slice(0, 2).map((a) => a.name).join(", ")}
                    {article.authors.length > 2 && ` +${article.authors.length - 2}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(article)}
                        className="p-1.5 text-ocean-400 hover:text-white hover:bg-ocean-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, article })}
                        className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-ocean-800 px-4 py-3 flex items-center justify-between">
            <p className="text-ocean-500 text-xs">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?page=${page - 1}`}
                  className="px-3 py-1.5 bg-ocean-800 text-ocean-300 text-xs rounded-lg hover:bg-ocean-700 transition-colors"
                >
                  Sebelumnya
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`?page=${page + 1}`}
                  className="px-3 py-1.5 bg-ocean-800 text-ocean-300 text-xs rounded-lg hover:bg-ocean-700 transition-colors"
                >
                  Berikutnya
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        open={formModal.open}
        title={formModal.article ? "Edit Artikel" : "Tambah Artikel Baru"}
        onClose={() => setFormModal({ open: false, article: null })}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Judul Artikel *</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required placeholder="Judul lengkap artikel" />
          </div>

          <div>
            <label className={labelCls}>Abstrak *</label>
            <textarea className={inputCls + " min-h-[100px] resize-y"} value={form.abstract} onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))} required placeholder="Abstrak artikel..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Volume *</label>
              <select className={inputCls} value={form.volumeId} onChange={(e) => setForm((f) => ({ ...f, volumeId: Number(e.target.value) }))} required>
                <option value="">Pilih volume</option>
                {volumes.map((v) => (
                  <option key={v.id} value={v.id}>
                    Vol {v.number} No {v.issue} ({v.year})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Kategori</label>
              <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                <option value="">Pilih kategori</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Halaman</label>
              <input className={inputCls} value={form.pages} onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))} placeholder="1-15" />
            </div>
            <div>
              <label className={labelCls}>Tanggal Terbit</label>
              <input type="date" className={inputCls} value={form.publishedAt} onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className={labelCls}>DOI</label>
            <input className={inputCls} value={form.doi} onChange={(e) => setForm((f) => ({ ...f, doi: e.target.value }))} placeholder="10.xxxxx/conserve.v1i1.001" />
          </div>

          <div>
            <label className={labelCls}>URL PDF</label>
            <input className={inputCls} value={form.pdfUrl} onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))} placeholder="/papers/artikel-01.pdf" />
          </div>

          <div>
            <label className={labelCls}>Kata Kunci (pisahkan dengan koma)</label>
            <input className={inputCls} value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="konservasi, laut, masyarakat" />
          </div>

          {/* Authors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls + " mb-0"}>Penulis *</label>
              <button type="button" onClick={addAuthor} className="text-xs text-ocean-400 hover:text-white transition-colors">
                + Tambah penulis
              </button>
            </div>
            <div className="space-y-2">
              {form.authors.map((author, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-start">
                  <input className={inputCls} value={author.name} onChange={(e) => updateAuthor(i, "name", e.target.value)} placeholder="Nama penulis" required />
                  <input className={inputCls} value={author.affiliation} onChange={(e) => updateAuthor(i, "affiliation", e.target.value)} placeholder="Institusi" />
                  <div className="flex gap-1">
                    <input className={inputCls} value={author.email} onChange={(e) => updateAuthor(i, "email", e.target.value)} placeholder="Email" />
                    {form.authors.length > 1 && (
                      <button type="button" onClick={() => removeAuthor(i)} className="text-red-500 hover:text-red-400 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setFormModal({ open: false, article: null })}
              className="px-4 py-2 text-sm text-ocean-400 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-ocean-950 font-semibold rounded-lg transition-colors disabled:opacity-50">
              {loading ? "Menyimpan..." : formModal.article ? "Simpan Perubahan" : "Tambah Artikel"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteModal.open}
        title="Hapus Artikel"
        onClose={() => setDeleteModal({ open: false, article: null })}
      >
        <p className="text-ocean-300 text-sm mb-1">Artikel berikut akan dihapus secara permanen:</p>
        <p className="text-white font-medium text-sm mb-6 p-3 bg-ocean-800 rounded-lg">
          {deleteModal.article?.title}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteModal({ open: false, article: null })}
            className="px-4 py-2 text-sm text-ocean-400 hover:text-white hover:bg-ocean-800 rounded-lg transition-colors">
            Batal
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </>
  )
}
