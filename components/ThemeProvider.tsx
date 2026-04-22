"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
type ThemeCtx = { theme: Theme; toggle: () => void }

const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} })
export const useTheme = () => useContext(Ctx)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    const resolved = stored ?? preferred
    setTheme(resolved)
    applyTheme(resolved)
    setMounted(true)
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    if (t === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }

  function toggle() {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark"
      localStorage.setItem("theme", next)
      applyTheme(next)
      return next
    })
  }

  if (!mounted) return <>{children}</>

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}
