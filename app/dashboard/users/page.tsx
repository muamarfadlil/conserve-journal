// app/dashboard/users/page.tsx
// Hanya SUPER_ADMIN yang dapat mengakses
import type { Metadata } from "next"
import { getSession, isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UsersTable from "@/components/dashboard/UsersTable"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Kelola Pengguna" }

export default async function UsersPage() {
  const session = await getSession().catch(() => null)
  if (!isSuperAdmin(session?.user.role)) redirect("/dashboard")

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Kelola Pengguna</h1>
        <p className="text-ocean-400 text-sm mt-1">
          Total <span className="text-white font-medium">{users.length}</span> pengguna terdaftar
        </p>
      </div>
      <UsersTable users={users} currentUserId={session!.user.id} />
    </div>
  )
}
