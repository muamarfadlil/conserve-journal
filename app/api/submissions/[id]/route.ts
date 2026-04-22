import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const submission = await prisma.submission.findUnique({
    where: { id: Number(params.id) },
    include: { submittedBy: { select: { name: true, email: true, role: true } } },
  })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = submission.submittedById === session.user.id
  const isPrivileged = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
  if (!isOwner && !isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(submission)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const submission = await prisma.submission.findUnique({ where: { id: Number(params.id) } })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = submission.submittedById === session.user.id
  const isPrivileged = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
  if (!isOwner && !isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const updated = await prisma.submission.update({
    where: { id: Number(params.id) },
    data: { ...body, updatedAt: new Date() },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const submission = await prisma.submission.findUnique({ where: { id: Number(params.id) } })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = submission.submittedById === session.user.id
  const isPrivileged = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
  if (!isOwner && !isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (submission.status !== "DRAFT" && !isPrivileged) {
    return NextResponse.json({ error: "Hanya draft yang bisa dihapus" }, { status: 400 })
  }

  await prisma.submission.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
