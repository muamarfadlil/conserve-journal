import type { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { isReviewer, isAdmin } from "@/lib/roles"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { Prisma, SubmissionStatus } from "@prisma/client"
import ReviewerSubmissionList from "@/components/dashboard/ReviewerSubmissionList"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Reviewer" }

const STATUS_ORDER = ["SUBMITTED", "UNDER_REVIEW", "REVISION", "DRAFT", "ACCEPTED", "REJECTED"]

export default async function ReviewerDashboardPage() {
  const session = await getSession().catch(() => null)
  if (!session || !isReviewer(session.user.role)) redirect("/dashboard?error=forbidden")

  const role = session.user.role
  const privileged = isAdmin(role)

  let submissions: Array<{
    id: number; title: string; author: string; status: string
    createdAt: Date; updatedAt: Date
    submittedBy: { name: string; email: string }
    assignedReviewer: { name: string } | null
  }> = []

  try {
    const where: Prisma.SubmissionWhereInput = privileged
      ? {}
      : {
          OR: [
            { assignedReviewerId: session.user.id },
            {
              assignedReviewerId: null,
              status: { in: ["SUBMITTED", "UNDER_REVIEW", "REVISION"] as SubmissionStatus[] },
            },
          ],
        }

    const raw = await prisma.submission.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, title: true, author: true, status: true,
        createdAt: true, updatedAt: true,
        submittedBy: { select: { name: true, email: true } },
        assignedReviewer: { select: { name: true } },
      },
    })

    submissions = raw.sort((a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    )
  } catch { /* DB offline */ }

  const counts = {
    total:     submissions.length,
    waiting:   submissions.filter(s => s.status === "SUBMITTED").length,
    reviewing: submissions.filter(s => s.status === "UNDER_REVIEW").length,
    revision:  submissions.filter(s => s.status === "REVISION").length,
    done:      submissions.filter(s => ["ACCEPTED", "REJECTED"].includes(s.status)).length,
  }

  const statCards = [
    { label: "Total",           value: counts.total,     color: "text-ocean-400", bg: "bg-ocean-800/60",  border: "border-ocean-700" },
    { label: "Menunggu",        value: counts.waiting,   color: "text-blue-400",  bg: "bg-blue-900/30",   border: "border-blue-800" },
    { label: "Sedang Ditinjau", value: counts.reviewing, color: "text-amber-400", bg: "bg-amber-900/30",  border: "border-amber-800" },
    { label: "Selesai",         value: counts.done,      color: "text-green-400", bg: "bg-green-900/30",  border: "border-green-800" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Panel Reviewer</h1>
        <p className="text-ocean-400 text-sm mt-1">
          {privileged
            ? "Semua submission masuk — tinjau, assign reviewer, dan tetapkan keputusan."
            : "Submission yang ditugaskan kepada Anda untuk ditinjau."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-ocean-900/40 border rounded-xl p-4
                        hover:border-opacity-80 hover:-translate-y-0.5
                        transition-all duration-200 ${s.border}`}
          >
            <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-2`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-ocean-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Searchable submission list (client component) */}
      <ReviewerSubmissionList submissions={submissions} privileged={privileged} />
    </div>
  )
}
