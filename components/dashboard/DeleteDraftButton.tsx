"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteDraftButton({ id, title }: { id: number; title: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Gagal menghapus draft")
      setOpen(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus draft")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Hapus draft"
        className="inline-flex items-center justify-center p-1.5 rounded-lg text-xs transition-colors
                   text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl
                          w-full max-w-sm shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-[var(--border-default)]">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-[var(--text-primary)] font-semibold text-sm">Hapus Draft</h3>
                <p className="text-[var(--text-muted)] text-xs">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-[var(--text-secondary)] text-sm">
                Draft berikut akan dihapus secara permanen:
              </p>
              <div className="px-3 py-2.5 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
                <p className="text-[var(--text-primary)] text-sm font-medium leading-snug line-clamp-2">
                  {title}
                </p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5 font-mono">#{String(id).padStart(3, "0")}</p>
              </div>

              {error && (
                <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setOpen(false); setError(null) }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg text-sm border border-[var(--border-default)]
                             text-[var(--text-secondary)] hover:border-ocean-400 hover:text-[var(--text-primary)]
                             transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500
                             text-white font-semibold transition-colors disabled:opacity-50
                             flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menghapus…
                    </>
                  ) : "Hapus Draft"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
