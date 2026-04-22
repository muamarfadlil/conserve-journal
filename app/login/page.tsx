import type { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/LoginForm"
import Image from "next/image"
import Link from "next/link"

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-16
                    bg-[var(--bg-base)]">

      {/* Ambient orbs — adapt to theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full
                        bg-ocean-500/12 dark:bg-ocean-600/12 blur-[100px]" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full
                        bg-teal-400/10 dark:bg-teal-500/8 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[800px] h-[400px] rounded-full
                        bg-ocean-600/8 dark:bg-ocean-800/20 blur-[120px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: `radial-gradient(circle, rgba(20,184,166,0.15) 1px, transparent 1px)`,
               backgroundSize: "28px 28px",
             }} />
        <div className="absolute top-0 left-0 right-0 h-px
                        bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5
                          bg-[var(--bg-surface-alt)]
                          dark:bg-gradient-to-br dark:from-ocean-700/80 dark:to-ocean-900
                          ring-2 ring-[var(--border-default)] relative group">
            <div className="absolute inset-0 rounded-full ring-2 ring-ocean-400/30 animate-pulse-ring" />
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
              <Image src="/logo.png" alt="CONSERVE" width={40} height={40}
                     className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="font-serif font-bold text-[var(--text-primary)] text-2xl tracking-wide">
            CONSERVE Journal
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1.5">
            Panel Pengelolaan · Journal of Community Services
          </p>
        </div>

        {/* Error banner */}
        {searchParams.error === "CredentialsSignin" && (
          <div className="mb-5 flex items-center gap-3 p-4 rounded-xl text-sm animate-scale-in
                          bg-red-500/15 border border-red-400/40 text-red-700
                          dark:bg-red-900/30 dark:border-red-700/60 dark:text-red-300">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Email atau password tidak valid.
          </div>
        )}

        {/* Card */}
        <div className="relative rounded-2xl p-8 shadow-xl
                        bg-[var(--bg-surface)] border border-[var(--border-default)]
                        dark:bg-ocean-900/60 dark:backdrop-blur-xl dark:border-ocean-700/50
                        dark:shadow-ocean-950/80 dark:ring-1 dark:ring-inset dark:ring-white/5">
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px
                          bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent" />

          <div className="mb-6">
            <h2 className="text-[var(--text-primary)] font-semibold text-lg">Masuk ke Akun</h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">Gunakan kredensial yang telah diberikan</p>
          </div>

          <LoginForm callbackUrl={searchParams.callbackUrl ?? "/dashboard"} />
        </div>

        <p className="text-center text-[var(--text-muted)] text-sm mt-6">
          Belum punya akun?{" "}
          <Link href="/register"
                className="text-gold-600 dark:text-gold-400 hover:text-gold-500 dark:hover:text-gold-300
                           font-medium transition-colors duration-150 underline-offset-2 hover:underline">
            Daftar di sini
          </Link>
        </p>

        <div className="mt-10 flex items-center justify-center gap-6
                        text-[var(--text-muted)] text-[10px] font-mono">
          <span>E-ISSN: 0000-0000</span>
          <span className="w-px h-3 bg-[var(--border-default)]" />
          <span>P-ISSN: 0000-0001</span>
        </div>
      </div>
    </div>
  )
}
