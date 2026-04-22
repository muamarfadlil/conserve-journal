"use client"

import { useEffect } from "react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[DashboardError]", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5
                      bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="font-serif font-semibold text-[var(--text-primary)] text-xl mb-2">
        Halaman Gagal Dimuat
      </h2>
      <p className="text-[var(--text-muted)] text-sm mb-6 max-w-xs">
        Terjadi kesalahan saat memuat halaman ini.
        {error.digest && <span className="block font-mono text-xs mt-1">ID: {error.digest}</span>}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl text-sm font-medium
                   bg-ocean-600 hover:bg-ocean-500 text-white
                   transition-all duration-200"
      >
        Coba Lagi
      </button>
    </div>
  )
}
