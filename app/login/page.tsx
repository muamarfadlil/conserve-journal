// app/login/page.tsx
import type { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Masuk",
  description: "Login ke panel pengelolaan CONSERVE Journal",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  const session = await getSession().catch(() => null)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-ocean-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full
                          bg-ocean-800 ring-2 ring-ocean-600 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-ocean-300"
                 stroke="currentColor" strokeWidth="1.8">
              <path d="M3 12c2-4 4-4 6 0s4 4 6 0" />
              <path d="M3 17c2-4 4-4 6 0s4 4 6 0" />
              <path d="M3 7c2-4 4-4 6 0s4 4 6 0" />
            </svg>
          </div>
          <h1 className="font-serif font-bold text-white text-2xl">CONSERVE Journal</h1>
          <p className="text-ocean-400 text-sm mt-1">Panel Pengelolaan Jurnal</p>
        </div>

        {/* Error dari OAuth redirect */}
        {searchParams.error === "CredentialsSignin" && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm text-center">
            Email atau password tidak valid.
          </div>
        )}

        <div className="bg-ocean-900 border border-ocean-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6">Masuk ke Akun</h2>
          <LoginForm callbackUrl={searchParams.callbackUrl ?? "/dashboard"} />
        </div>

        <p className="text-center text-ocean-500 text-sm mt-6">
          Belum punya akun?{" "}
          <a href="/register" className="text-gold-400 hover:text-gold-300 font-medium">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  )
}
