"use client"

import { useTheme } from "./ThemeProvider"

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg
                 text-ocean-400 dark:text-ocean-400
                 hover:text-ocean-600 dark:hover:text-white
                 hover:bg-ocean-100 dark:hover:bg-ocean-800
                 border border-transparent hover:border-ocean-200 dark:hover:border-ocean-700
                 transition-all duration-200 focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-ocean-500 overflow-hidden"
    >
      {/* Sun icon – visible in dark mode (click to go light) */}
      <span
        className={`absolute inset-0 flex items-center justify-center
                    transition-all duration-300
                    ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
        aria-hidden
      >
        <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m8.66-10h-1M4.34 12h-1m15.07-6.07-.71.71M5.64 18.36l-.71.71m0-12.72.71.71M18.36 18.36l.71.71M12 7a5 5 0 100 10A5 5 0 0012 7z" />
        </svg>
      </span>

      {/* Moon icon – visible in light mode (click to go dark) */}
      <span
        className={`absolute inset-0 flex items-center justify-center
                    transition-all duration-300
                    ${!isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`}
        aria-hidden
      >
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </span>
    </button>
  )
}
