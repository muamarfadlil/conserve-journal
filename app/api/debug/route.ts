// app/api/debug/route.ts — SEMENTARA untuk diagnosa, hapus setelah selesai
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const result: Record<string, unknown> = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET ✓" : "NOT SET ✗",
    DATABASE_URL: process.env.DATABASE_URL
      ? "SET ✓ (" + process.env.DATABASE_URL.split("@")[1]?.split("/")[0] + ")"
      : "NOT SET ✗",
    db: "not tested",
    userCount: null as number | null,
    error: null as string | null,
  }

  try {
    const count = await prisma.user.count()
    result.db = "connected ✓"
    result.userCount = count
  } catch (e) {
    result.db = "failed ✗"
    result.error = (e as Error).message
  }

  return NextResponse.json(result)
}
