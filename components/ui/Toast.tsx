"use client"

import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, ReactNode,
} from "react"

type ToastType = "success" | "error" | "info" | "warning"
type Toast = { id: number; message: string; type: ToastType }
type ToastCtxValue = { showToast: (message: string, type?: ToastType) => void }

const ToastCtx = createContext<ToastCtxValue>({ showToast: () => {} })
export const useToast = () => useContext(ToastCtx)

const STYLES: Record<ToastType, { wrap: string; icon: string }> = {
  success: { wrap: "bg-green-900/95 border-green-700 text-green-50",  icon: "text-green-400" },
  error:   { wrap: "bg-red-900/95 border-red-700 text-red-50",        icon: "text-red-400" },
  info:    { wrap: "bg-ocean-800/95 border-ocean-600 text-ocean-50",  icon: "text-ocean-300" },
  warning: { wrap: "bg-amber-900/95 border-amber-700 text-amber-50",  icon: "text-amber-400" },
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const s = STYLES[toast.type]

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3800)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
                  shadow-xl shadow-black/40 text-sm max-w-xs pointer-events-auto
                  animate-fade-up ${s.wrap}`}
    >
      <span className={`flex-shrink-0 mt-0.5 ${s.icon}`}>{ICONS[toast.type]}</span>
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Tutup notifikasi"
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counterRef.current
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
