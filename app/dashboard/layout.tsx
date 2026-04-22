import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardShell from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession().catch(() => null)
  if (!session) redirect("/login")

  return <DashboardShell user={session.user}>{children}</DashboardShell>
}
