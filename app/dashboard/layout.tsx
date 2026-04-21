// app/dashboard/layout.tsx
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen bg-ocean-950">
      <DashboardSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-ocean-900 border-b border-ocean-800 px-6 py-3 flex items-center justify-between">
          <p className="text-ocean-400 text-sm">
            Panel Pengelolaan{" "}
            <span className="text-white font-medium">CONSERVE Journal</span>
          </p>
          <p className="text-ocean-600 text-xs hidden sm:block">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
