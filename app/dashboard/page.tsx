import type { Metadata } from "next"
import { getSession, isAdmin, isSuperAdmin } from "@/lib/auth"
import { isReviewer } from "@/lib/roles"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await getSession().catch(() => null)
  const role = session?.user.role ?? "USER"

  let articleCount = 0, authorCount = 0, volumeCount = 0, userCount: number | null = null
  try {
    ;[articleCount, authorCount, volumeCount, userCount] = await Promise.all([
      prisma.article.count(),
      prisma.author.count(),
      prisma.volume.count(),
      isSuperAdmin(role) ? prisma.user.count() : Promise.resolve(null),
    ])
  } catch { /* DB offline */ }

  const stats = [
    {
      label: "Total Artikel", value: articleCount, show: true,
      valueCls: "text-ocean-600 dark:text-ocean-300",
      iconBg: "bg-ocean-200/80 dark:bg-ocean-700/60",
      iconCls: "text-ocean-600 dark:text-ocean-300",
      border: "border-ocean-400/60 dark:border-ocean-700 hover:border-ocean-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      label: "Total Penulis", value: authorCount, show: true,
      valueCls: "text-gold-600 dark:text-gold-400",
      iconBg: "bg-gold-100/80 dark:bg-gold-500/20",
      iconCls: "text-gold-600 dark:text-gold-400",
      border: "border-gold-400/60 dark:border-gold-700/40 hover:border-gold-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
    {
      label: "Total Volume", value: volumeCount, show: true,
      valueCls: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100/80 dark:bg-teal-500/20",
      iconCls: "text-teal-600 dark:text-teal-400",
      border: "border-teal-400/60 dark:border-teal-700/40 hover:border-teal-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      label: "Total Pengguna", value: userCount ?? 0, show: isSuperAdmin(role),
      valueCls: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100/80 dark:bg-purple-500/20",
      iconCls: "text-purple-600 dark:text-purple-400",
      border: "border-purple-400/60 dark:border-purple-700/40 hover:border-purple-500",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
  ].filter(s => s.show)

  const actions = [
    {
      href: "/submit", label: "Submit Artikel", show: true,
      desc: "Kirim naskah artikel ilmiah baru untuk ditinjau",
      darkAccent: "dark:from-ocean-600/20 dark:to-transparent",
      darkBorder: "dark:hover:border-ocean-600",
      iconCls: "text-ocean-600 dark:text-ocean-400",
      iconBg: "bg-ocean-200/60 dark:bg-ocean-800",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    },
    {
      href: "/dashboard/submissions", label: "Artikel Saya", show: true,
      desc: "Lihat dan kelola semua artikel yang telah disubmit",
      darkAccent: "dark:from-ocean-700/20 dark:to-transparent",
      darkBorder: "dark:hover:border-ocean-600",
      iconCls: "text-ocean-600 dark:text-ocean-300",
      iconBg: "bg-ocean-200/60 dark:bg-ocean-800",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      href: "/dashboard/reviewer", label: "Panel Reviewer", show: isReviewer(role),
      desc: "Tinjau dan beri keputusan pada artikel yang masuk",
      darkAccent: "dark:from-blue-700/20 dark:to-transparent",
      darkBorder: "dark:hover:border-blue-700",
      iconCls: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100/60 dark:bg-blue-900/60",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      href: "/dashboard/articles", label: "Kelola Artikel", show: isAdmin(role),
      desc: "Tambah, edit, dan terbitkan artikel jurnal",
      darkAccent: "dark:from-amber-700/20 dark:to-transparent",
      darkBorder: "dark:hover:border-amber-700",
      iconCls: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100/60 dark:bg-amber-900/60",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      href: "/dashboard/users", label: "Kelola Pengguna", show: isSuperAdmin(role),
      desc: "Manajemen akun, role, dan hak akses pengguna",
      darkAccent: "dark:from-red-800/20 dark:to-transparent",
      darkBorder: "dark:hover:border-red-800",
      iconCls: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100/60 dark:bg-red-900/60",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
  ].filter(a => a.show)

  const firstName = session?.user.name?.split(" ")[0] ?? "Pengguna"

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border p-6 sm:p-8
                      bg-[var(--bg-surface)] border-[var(--border-default)]
                      dark:bg-gradient-to-br dark:from-ocean-800/60 dark:via-ocean-900/60 dark:to-ocean-950
                      dark:border-ocean-700/50">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full
                        bg-ocean-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px
                        bg-gradient-to-r from-transparent via-[var(--border-default)]/60 to-transparent" />
        <div className="relative">
          <p className="text-[var(--text-muted)] text-sm font-mono uppercase tracking-widest mb-1">
            Selamat datang
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold
                         text-[var(--text-primary)] dark:bg-gradient-to-r dark:from-white dark:to-ocean-200
                         dark:bg-clip-text dark:text-transparent">
            {firstName}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm max-w-md">
            Ringkasan aktivitas dan akses cepat pengelolaan jurnal CONSERVE.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      {stats.length > 0 && (
        <div>
          <h2 className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest mb-3">
            Statistik Jurnal
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`group relative rounded-xl p-5 cursor-default overflow-hidden
                             transition-all duration-300 hover:-translate-y-1
                             bg-[var(--bg-surface)] border ${stat.border}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="absolute top-0 inset-x-0 h-px
                                bg-gradient-to-r from-transparent via-current to-transparent
                                opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className={`inline-flex p-2.5 rounded-lg ${stat.iconBg} ${stat.iconCls} mb-3
                                 transition-transform duration-300 group-hover:scale-110`}>
                  {stat.icon}
                </div>
                <p className={`text-3xl font-bold tabular-nums tracking-tight ${stat.valueCls}`}>
                  {stat.value.toLocaleString("id-ID")}
                </p>
                <p className="text-[var(--text-muted)] text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest mb-3">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {actions.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative flex items-start gap-4 p-5 rounded-xl overflow-hidden
                          transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
                          bg-[var(--bg-surface)] border border-[var(--border-default)]
                          hover:border-ocean-400 ${action.darkBorder}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Dark mode gradient sweep */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.darkAccent}
                               opacity-0 dark:group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className={`p-2.5 rounded-xl ${action.iconBg} ${action.iconCls}
                                 transition-all duration-300 group-hover:scale-110`}>
                  {action.icon}
                </div>
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-[var(--text-primary)] font-semibold text-sm">{action.label}</p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5 leading-relaxed">{action.desc}</p>
              </div>
              <svg
                className="relative w-4 h-4 text-[var(--border-default)] flex-shrink-0 mt-0.5
                           group-hover:text-[var(--text-muted)] group-hover:translate-x-0.5
                           transition-all duration-200"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
