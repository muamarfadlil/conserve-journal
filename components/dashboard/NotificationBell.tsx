"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"

type Notif = {
  id: number
  type: string
  title: string
  body: string
  isRead: boolean
  link: string | null
  createdAt: string
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  STATUS_CHANGE: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ASSIGNED: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  COMMENT: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "Baru saja"
  if (mins < 60)  return `${mins} mnt lalu`
  if (hours < 24) return `${hours} jam lalu`
  return `${days} hari lalu`
}

export default function NotificationBell() {
  const [notifs, setNotifs]     = useState<Notif[]>([])
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const panelRef                = useRef<HTMLDivElement>(null)

  const unread = notifs.filter(n => !n.isRead).length

  const fetchNotifs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) setNotifs(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    })
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  async function markRead(id: number) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  return (
    <div className="relative flex-shrink-0" ref={panelRef}>
      <button
        onClick={() => { setOpen(v => !v); if (!open) fetchNotifs() }}
        aria-label="Notifikasi"
        className="relative p-2 rounded-lg text-ocean-400 hover:text-white
                   hover:bg-ocean-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5
                           bg-red-500 text-white text-[9px] font-bold rounded-full
                           flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <div className={`absolute right-0 top-full mt-2 w-80 z-50
                       bg-ocean-900/98 backdrop-blur-sm border border-ocean-700/60
                       rounded-2xl shadow-2xl shadow-ocean-950/60 overflow-hidden
                       transition-all duration-200 origin-top-right
                       ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-ocean-800">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm font-semibold">Notifikasi</h3>
            {unread > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-900/60
                               border border-red-700 text-red-300 font-mono">
                {unread} baru
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] text-ocean-400 hover:text-white transition-colors"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin w-5 h-5 text-ocean-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : notifs.length === 0 ? (
            <div className="py-10 text-center">
              <svg className="w-8 h-8 text-ocean-700 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-ocean-600 text-xs">Belum ada notifikasi</p>
            </div>
          ) : (
            notifs.map(n => {
              const Wrapper = n.link ? Link : "div"
              return (
                <Wrapper
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => { if (!n.isRead) markRead(n.id); if (n.link) setOpen(false) }}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-ocean-800/50
                              hover:bg-ocean-800/40 transition-colors cursor-pointer
                              ${!n.isRead ? "bg-ocean-800/20" : ""}`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0
                                   ${n.isRead ? "bg-ocean-800 text-ocean-500" : "bg-ocean-700 text-ocean-300"}`}>
                    {TYPE_ICON[n.type] ?? TYPE_ICON.COMMENT}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-medium leading-snug
                                     ${n.isRead ? "text-ocean-400" : "text-white"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-ocean-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-ocean-500 mt-0.5 leading-relaxed line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-ocean-700 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </Wrapper>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
