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
      color: "text-ocean-300", iconBg: "bg-ocean-700/60", border: "border-ocean-700",
      glow: "hover:shadow-glow-ocean",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      label: "Total Penulis", value: authorCount, show: true,
      color: "text-gold-400", iconBg: "bg-gold-500/20", border: "border-gold-700/40",
      glow: "hover:shadow-glow-gold",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
    {
      label: "Total Volume", value: volumeCount, show: true,
      color: "text-teal-400", iconBg: "bg-teal-500/20", border: "border-teal-700/40",
      glow: "",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    },
    {
      label: "Total Pengguna", value: userCount ?? 0, show: isSuperAdmin(role),
      color: "text-purple-400", iconBg: "bg-purple-500/20", border: "border-purple-700/40",
      glow: "",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
  ].filter(s => s.show)

  const actions = [
    {
      href: "/submit", label: "Submit Artikel", show: true,
      desc: "Kirim naskah artikel ilmiah baru untuk ditinjau",
      accent: "from-ocean-600/20 to-transparent", border: "hover:border-ocean-600",
      iconColor: "text-ocean-400", iconBg: "bg-ocean-800",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    },
    {
      href: "/dashboard/submissions", label: "Artikel Saya", show: true,
      desc: "Lihat dan kelola semua artikel yang telah disubmit",
      accent: "from-ocean-700/20 to-transparent", border: "hover:border-ocean-600",
      iconColor: "text-ocean-300", iconBg: "bg-ocean-800",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      href: "/dashboard/reviewer", label: "Panel Reviewer", show: isReviewer(role),
      desc: "Tinjau dan beri keputusan pada artikel yang masuk",
      accent: "from-blue-700/20 to-transparent", border: "hover:border-blue-700",
      iconColor: "text-blue-400", iconBg: "bg-blue-900/60",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    },
    {
      href: "/dashboard/articles", label: "Kelola Artikel", show: isAdmin(role),
      desc: "Tambah, edit, dan terbitkan artikel jurnal",
      accent: "from-amber-700/20 to-transparent", border: "hover:border-amber-700",
      iconColor: "text-amber-400", iconBg: "bg-amber-900/60",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      href: "/dashboard/users", label: "Kelola Pengguna", show: isSuperAdmin(role),
      desc: "Manajemen akun, role, dan hak akses pengguna",
      accent: "from-red-800/20 to-transparent", border: "hover:border-red-800",
      iconColor: "text-red-400", iconBg: "bg-red-900/60",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
  ].filter(a => a.show)

  const firstName = session?.user.name?.split(" ")[0] ?? "Pengguna"

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl
                      bg-gradient-to-br from-ocean-800/60 via-ocean-900/60 to-ocean-950
                      border border-ocean-700/50 p-6 sm:p-8">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full
                        bg-ocean-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px
                        bg-gradient-to-r from-transparent via-ocean-600/30 to-transparent" />
        <div className="relative">
          <p className="text-ocean-400 text-sm font-mono uppercase tracking-widest mb-1">
            Selamat datang
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold
                         bg-gradient-to-r from-white to-ocean-200 bg-clip-text text-transparent">
            {firstName}
          </h1>
          <p className="text-ocean-400 mt-2 text-sm max-w-md">
            Ringkasan aktivitas dan akses cepat pengelolaan jurnal CONSERVE.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      {stats.length > 0 && (
        <div>
          <h2 className="text-ocean-500 text-xs font-mono uppercase tracking-widest mb-3">
            Statistik Jurnal
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`group relative bg-ocean-900/70 border rounded-xl p-5
                             transition-all duration-300 hover:-translate-y-1
                             hover:bg-ocean-900 cursor-default overflow-hidden
                             ${stat.border} ${stat.glow}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Subtle top glow line */}
                <div className="absolute top-0 inset-x-0 h-px
                                bg-gradient-to-r from-transparent via-current to-transparent
                                opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <div className={`inline-flex p-2.5 rounded-lg ${stat.iconBg} ${stat.color} mb-3
                                 transition-transform duration-300 group-hover:scale-110`}>
                  {stat.icon}
                </div>
                <p className={`text-3xl font-bold tabular-nums tracking-tight ${stat.color}`}>
                  {stat.value.toLocaleString("id-ID")}
                </p>
                <p className="text-ocean-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-ocean-500 text-xs font-mono uppercase tracking-widest mb-3">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {actions.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative flex items-start gap-4 p-5 rounded-xl overflow-hidden
                          bg-ocean-900/60 border border-ocean-800
                          transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
                          hover:shadow-ocean-950/60 ${action.border}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Gradient sweep on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.accent}
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className={`p-2.5 rounded-xl ${action.iconBg} ${action.iconColor}
                                 transition-all duration-300 group-hover:scale-110`}>
                  {action.icon}
                </div>
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-white font-semibold text-sm group-hover:text-white transition-colors">
                  {action.label}
                </p>
                <p className="text-ocean-500 text-xs mt-0.5 leading-relaxed">{action.desc}</p>
              </div>
              <svg
                className="relative w-4 h-4 text-ocean-700 group-hover:text-ocean-400 flex-shrink-0 mt-0.5
                           group-hover:translate-x-0.5 transition-all duration-200"
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
