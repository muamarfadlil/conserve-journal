// app/dashboard/page.tsx
import type { Metadata } from "next"
import { getSession, isAdmin, isSuperAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await getSession()
  const role = session?.user.role ?? "USER"

  // Stats
  const [articleCount, authorCount, volumeCount, userCount] = await Promise.all([
    prisma.article.count(),
    prisma.author.count(),
    prisma.volume.count(),
    isSuperAdmin(role) ? prisma.user.count() : Promise.resolve(null),
  ])

  const stats = [
    {
      label: "Total Artikel",
      value: articleCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "text-ocean-400",
      bg: "bg-ocean-800",
      show: true,
    },
    {
      label: "Total Penulis",
      value: authorCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "text-gold-400",
      bg: "bg-gold-900/30",
      show: true,
    },
    {
      label: "Total Volume",
      value: volumeCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "text-teal-400",
      bg: "bg-teal-900/30",
      show: true,
    },
    {
      label: "Total Pengguna",
      value: userCount ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "text-purple-400",
      bg: "bg-purple-900/30",
      show: isSuperAdmin(role),
    },
  ]

  const actions = [
    {
      href: "/dashboard/articles",
      label: "Kelola Artikel",
      desc: "Tambah, edit, atau hapus artikel jurnal",
      show: isAdmin(role),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      href: "/dashboard/users",
      label: "Kelola Pengguna",
      desc: "Manajemen akun dan peran pengguna",
      show: isSuperAdmin(role),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: "/",
      label: "Lihat Jurnal",
      desc: "Buka halaman publik jurnal",
      show: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">
          Selamat datang, {session?.user.name}
        </h1>
        <p className="text-ocean-400 mt-1 text-sm">
          Ringkasan data dan akses cepat pengelolaan jurnal.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.filter((s) => s.show).map((stat) => (
          <div
            key={stat.label}
            className="bg-ocean-900 border border-ocean-800 rounded-xl p-5"
          >
            <div className={`inline-flex p-2.5 rounded-lg ${stat.bg} ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-ocean-400 text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.filter((a) => a.show).map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-start gap-4 p-5 bg-ocean-900 border border-ocean-800
                         hover:border-ocean-600 rounded-xl transition-all duration-200 group"
            >
              <div className="p-2 bg-ocean-800 group-hover:bg-ocean-700 rounded-lg text-ocean-300 transition-colors flex-shrink-0">
                {action.icon}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{action.label}</p>
                <p className="text-ocean-500 text-xs mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
