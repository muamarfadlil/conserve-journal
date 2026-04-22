// middleware.ts
// Proteksi rute /dashboard — harus login
// Proteksi /dashboard/users — harus SUPER_ADMIN

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    const role = token?.role as string | undefined

    if (pathname.startsWith("/dashboard/users") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url))
    }

    if (pathname.startsWith("/dashboard/articles") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url))
    }

    if (
      (pathname.startsWith("/dashboard/reviewer") || pathname.startsWith("/reviewer/")) &&
      role !== "REVIEWER" && role !== "ADMIN" && role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/submit", "/submit/:path*", "/reviewer/:path*"],
}
