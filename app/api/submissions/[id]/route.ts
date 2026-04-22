import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin, isReviewer } from "@/lib/roles"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const submission = await prisma.submission.findUnique({
    where: { id: Number(params.id) },
    include: {
      submittedBy: { select: { name: true, email: true, role: true } },
      assignedReviewer: { select: { id: true, name: true, email: true } },
    },
  })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = submission.submittedById === session.user.id
  const isAssignedReviewer = submission.assignedReviewerId === session.user.id
  const canAccess = isOwner || isAdmin(session.user.role) ||
    (isReviewer(session.user.role) && (isAssignedReviewer || !submission.assignedReviewerId))

  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(submission)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const submission = await prisma.submission.findUnique({ where: { id: Number(params.id) } })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const role = session.user.role
  const isOwner = submission.submittedById === session.user.id
  const isAssignedReviewer = submission.assignedReviewerId === session.user.id
  const canReview = isReviewer(role) && (isAssignedReviewer || !submission.assignedReviewerId)

  if (!isOwner && !isAdmin(role) && !canReview) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()

  // REVIEWER: hanya boleh update comments & reviewerNote, tidak bisa ubah status final
  if (!isAdmin(role) && canReview) {
    const { comments, reviewerNote } = body
    const updated = await prisma.submission.update({
      where: { id: Number(params.id) },
      data: {
        ...(comments !== undefined ? { comments } : {}),
        ...(reviewerNote !== undefined ? { reviewerNote } : {}),
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(updated)
  }

  // ADMIN/SUPER_ADMIN: boleh update semua termasuk status dan assign reviewer
  const updated = await prisma.submission.update({
    where: { id: Number(params.id) },
    data: { ...body, updatedAt: new Date() },
    include: { submittedBy: { select: { id: true } } },
  })

  // Kirim notifikasi ke penulis bila status berubah
  if (body.status && body.status !== submission.status) {
    const STATUS_NOTIF: Record<string, { title: string; body: string }> = {
      UNDER_REVIEW: { title: "Artikel Sedang Direview", body: `Artikel "${submission.title}" kini sedang dalam proses review.` },
      REVISION:     { title: "Revisi Diperlukan",       body: `Artikel "${submission.title}" memerlukan revisi. Silakan cek catatan reviewer.` },
      ACCEPTED:     { title: "Artikel Diterima!",       body: `Selamat! Artikel "${submission.title}" telah diterima untuk dipublikasikan.` },
      REJECTED:     { title: "Artikel Ditolak",         body: `Artikel "${submission.title}" tidak dapat diterima. Hubungi editor untuk informasi lebih lanjut.` },
      PUBLISHED:    { title: "Artikel Dipublikasikan!", body: `Artikel "${submission.title}" kini telah dipublikasikan di CONSERVE Journal.` },
    }
    const notif = STATUS_NOTIF[body.status]
    if (notif) {
      await prisma.notification.create({
        data: {
          userId: submission.submittedById,
          type: "STATUS_CHANGE",
          title: notif.title,
          body: notif.body,
          link: `/dashboard/submissions`,
        },
      })
    }
  }

  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const submission = await prisma.submission.findUnique({ where: { id: Number(params.id) } })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = submission.submittedById === session.user.id
  if (!isOwner && !isAdmin(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (submission.status !== "DRAFT" && !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Hanya draft yang dapat dihapus" }, { status: 400 })
  }

  await prisma.submission.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
