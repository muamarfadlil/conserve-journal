"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4
                    bg-[var(--bg-base)]">
      <div className="text-center space-y-6 max-w-md animate-fade-up">

        <div className="font-serif font-bold text-[100px] sm:text-[140px] leading-none select-none
                        bg-gradient-to-b from-red-400 to-red-700
                        dark:from-red-600 dark:to-red-900
                        bg-clip-text text-transparent">
          500
        </div>

        <div className="space-y-2">
          <h1 className="font-serif font-semibold text-[var(--text-primary)] text-2xl">
            Terjadi Kesalahan
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu.
          </p>
          {error.digest && (
            <p className="text-[var(--text-muted)] text-xs font-mono mt-2">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                       bg-ocean-600 hover:bg-ocean-500 text-white
                       transition-all duration-200"
          >
            Coba Lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                       bg-[var(--bg-surface)] border border-[var(--border-default)]
                       text-[var(--text-primary)] hover:border-ocean-400
                       transition-all duration-200"
          >
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  )
}
