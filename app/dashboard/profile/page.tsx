import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/dashboard/ProfileForm"

export const metadata = { title: "Profil Saya – CONSERVE Journal" }

export default async function ProfilePage() {
  const session = await getSession().catch(() => null)
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, avatarUrl: true, bio: true, affiliation: true, orcidId: true, createdAt: true },
  })
  if (!user) redirect("/login")

  const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: "Super Admin", ADMIN: "Admin", REVIEWER: "Reviewer", USER: "Penulis",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Profil Saya</h1>
        <p className="text-[var(--text-muted)] text-sm mt-0.5">
          Kelola informasi publik dan pengaturan akun Anda.
        </p>
      </div>

      <div className="rounded-2xl p-6 shadow-lg
                      bg-[var(--bg-surface)] border border-[var(--border-default)]
                      dark:bg-ocean-900/60 dark:backdrop-blur-xl dark:border-ocean-700/50
                      dark:shadow-ocean-950/40">
        {/* Account info strip */}
        <div className="flex items-center justify-between mb-6 pb-5
                        border-b border-[var(--border-default)] dark:border-ocean-800/70">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-0.5">Email</p>
            <p className="text-sm text-[var(--text-primary)] font-medium">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)] mb-0.5">Peran</p>
            <span className="text-xs font-mono text-ocean-600 dark:text-ocean-300">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
        </div>

        <ProfileForm
          initial={{
            name:        user.name ?? "",
            bio:         user.bio ?? "",
            affiliation: user.affiliation ?? "",
            orcidId:     user.orcidId ?? "",
            avatarUrl:   user.avatarUrl ?? "",
          }}
        />
      </div>

      <p className="text-center text-[var(--text-muted)] text-xs">
        Bergabung sejak {new Date(user.createdAt).toLocaleDateString("id-ID", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </p>
    </div>
  )
}
