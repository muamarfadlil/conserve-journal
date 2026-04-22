import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/roles"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const reviewers = await prisma.user.findMany({
    where: { role: { in: ["REVIEWER", "ADMIN", "SUPER_ADMIN"] }, isActive: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(reviewers)
}
