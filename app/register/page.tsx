import type { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import RegisterForm from "@/components/auth/RegisterForm"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Daftar Akun",
}

export default async function RegisterPage() {
  const session = await getSession().catch(() => null)
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen relative overflow-hidden bg-ocean-950 flex items-center justify-center px-4 py-16">

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-40 w-[600px] h-[600px] rounded-full
                        bg-teal-600/10 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full
                        bg-ocean-600/12 blur-[80px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full
                        bg-ocean-500/8 blur-[60px]" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-40"
             style={{
               backgroundImage: `radial-gradient(circle, rgba(20,184,166,0.08) 1px, transparent 1px)`,
               backgroundSize: "28px 28px",
             }} />
        <div className="absolute top-0 left-0 right-0 h-px
                        bg-gradient-to-r from-transparent via-ocean-500/40 to-transparent" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5
                          bg-gradient-to-br from-ocean-700/80 to-ocean-900
                          ring-2 ring-ocean-600/60 relative">
            <div className="absolute inset-0 rounded-full ring-2 ring-ocean-400/30 animate-pulse-ring" />
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
              <Image src="/logo.png" alt="CONSERVE" width={40} height={40}
                     className="w-full h-full object-contain" />
            </div>
          </div>

          <h1 className="font-serif font-bold text-white text-2xl tracking-wide">
            Buat Akun Penulis
          </h1>
          <p className="text-ocean-400 text-sm mt-1.5">
            Daftar untuk mengajukan artikel ke CONSERVE Journal
          </p>
        </div>

        {/* Glass card */}
        <div className="relative bg-ocean-900/60 backdrop-blur-xl border border-ocean-700/50
                        rounded-2xl p-8 shadow-2xl shadow-ocean-950/80
                        ring-1 ring-inset ring-white/5">
          <div className="absolute top-0 left-8 right-8 h-px
                          bg-gradient-to-r from-transparent via-ocean-500/50 to-transparent" />

          <div className="mb-6">
            <h2 className="text-white font-semibold text-lg">Informasi Akun</h2>
            <p className="text-ocean-500 text-xs mt-0.5">Semua kolom wajib diisi</p>
          </div>

          <RegisterForm />
        </div>

        <p className="text-center text-ocean-500 text-sm mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium
                                        transition-colors duration-150 underline-offset-2
                                        hover:underline">
            Masuk di sini
          </Link>
        </p>

        <div className="mt-10 flex items-center justify-center gap-6 text-ocean-700 text-[10px] font-mono">
          <span>E-ISSN: 0000-0000</span>
          <span className="w-px h-3 bg-ocean-800" />
          <span>P-ISSN: 0000-0001</span>
        </div>
      </div>
    </div>
  )
}
