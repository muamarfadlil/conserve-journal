// middleware.ts
// Proteksi rute /dashboard — harus login
// Proteksi /dashboard/users — harus SUPER_ADMIN

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Rute /dashboard/users hanya untuk SUPER_ADMIN
    if (pathname.startsWith("/dashboard/users") && token?.role !== "SUPER_ADMIN") {
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
  matcher: ["/dashboard/:path*", "/submit", "/reviewer/:path*"],
}
