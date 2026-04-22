import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin, isReviewer } from "@/lib/roles"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role

  let where = {}
  if (isAdmin(role)) {
    // ADMIN/SUPER_ADMIN: semua submission
    where = {}
  } else if (isReviewer(role)) {
    // REVIEWER: hanya yang di-assign kepadanya, atau status SUBMITTED/UNDER_REVIEW/REVISION yang belum di-assign
    where = {
      OR: [
        { assignedReviewerId: session.user.id },
        { assignedReviewerId: null, status: { in: ["SUBMITTED", "UNDER_REVIEW", "REVISION"] } },
      ],
    }
  } else {
    // USER: hanya milik sendiri
    where = { submittedById: session.user.id }
  }

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, author: true, status: true,
      createdAt: true, updatedAt: true,
      submittedBy: { select: { name: true, email: true } },
      assignedReviewer: { select: { name: true } },
    },
  })

  return NextResponse.json(submissions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { id, status, assignedReviewerId, ...data } = body

  if (id) {
    const existing = await prisma.submission.findUnique({ where: { id: Number(id) } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const isOwner = existing.submittedById === session.user.id
    if (!isOwner && !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const updated = await prisma.submission.update({
      where: { id: Number(id) },
      data: {
        ...data,
        status: status ?? existing.status,
        ...(isAdmin(session.user.role) && assignedReviewerId !== undefined
          ? { assignedReviewerId: assignedReviewerId || null }
          : {}),
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(updated)
  }

  const submission = await prisma.submission.create({
    data: { ...data, status: status ?? "DRAFT", submittedById: session.user.id },
  })
  return NextResponse.json(submission)
}
