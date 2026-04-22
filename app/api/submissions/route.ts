import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role
  const isPrivileged = role === "ADMIN" || role === "SUPER_ADMIN"

  const submissions = await prisma.submission.findMany({
    where: isPrivileged ? undefined : { submittedById: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, author: true, status: true,
      createdAt: true, updatedAt: true,
      submittedBy: { select: { name: true, email: true } },
    },
  })

  return NextResponse.json(submissions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { id, status, ...data } = body

  if (id) {
    const existing = await prisma.submission.findUnique({ where: { id: Number(id) } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (existing.submittedById !== session.user.id && session.user.role === "USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const updated = await prisma.submission.update({
      where: { id: Number(id) },
      data: { ...data, status: status ?? existing.status, updatedAt: new Date() },
    })
    return NextResponse.json(updated)
  }

  const submission = await prisma.submission.create({
    data: { ...data, status: status ?? "DRAFT", submittedById: session.user.id },
  })
  return NextResponse.json(submission)
}
