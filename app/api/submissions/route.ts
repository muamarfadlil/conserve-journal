import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin, isReviewer } from "@/lib/roles"
import { rateLimit } from "@/lib/rate-limit"
import sanitizeHtml from "sanitize-html"

// Allowed HTML tags/attrs for rich-text content from Tiptap
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "strong", "em", "u", "s", "code", "pre",
    "ul", "ol", "li",
    "blockquote",
    "table", "thead", "tbody", "tr", "th", "td",
    "a", "img",
    "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    "*": ["class", "style"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["https", "http", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  transformTags: {
    // Force external links to open safely
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer" },
    }),
  },
}

function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS)
}

// Fields that contain Tiptap HTML output
const HTML_FIELDS = ["introduction", "methodology", "results", "conclusion", "references"] as const

function sanitizeSubmissionData(data: Record<string, unknown>): Record<string, unknown> {
  const clean = { ...data }
  for (const field of HTML_FIELDS) {
    if (typeof clean[field] === "string") {
      clean[field] = sanitizeRichText(clean[field] as string)
    }
  }
  return clean
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role

  let where = {}
  if (isAdmin(role)) {
    where = {}
  } else if (isReviewer(role)) {
    where = {
      OR: [
        { assignedReviewerId: session.user.id },
        { assignedReviewerId: null, status: { in: ["SUBMITTED", "UNDER_REVIEW", "REVISION"] } },
      ],
    }
  } else {
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

  // Rate limit submissions: 10 saves per user per minute
  const rl = rateLimit(`submissions:${session.user.id}`, 10, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Tunggu sebentar." },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { id, status, assignedReviewerId, ...data } = body

  // Sanitize all rich-text HTML fields
  const safeData = sanitizeSubmissionData(data)

  if (id) {
    const existing = await prisma.submission.findUnique({ where: { id: Number(id) } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const isOwner = existing.submittedById === session.user.id
    if (!isOwner && !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await prisma.submission.update({
      where: { id: Number(id) },
      data: {
        ...(safeData as any),
        status: status ?? existing.status,
        ...(isAdmin(session.user.role) && assignedReviewerId !== undefined
          ? { assignedReviewerId: assignedReviewerId || null }
          : {}),
        updatedAt: new Date(),
      },
    })
    return NextResponse.json(updated)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submission = await prisma.submission.create({
    data: { ...(safeData as any), status: status ?? "DRAFT", submittedById: session.user.id },
  })
  return NextResponse.json(submission)
}
