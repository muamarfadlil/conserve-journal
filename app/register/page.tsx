// app/register/page.tsx
import type { Metadata } from "next"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import RegisterForm from "@/components/auth/RegisterForm"

export const metadata: Metadata = {
  title: "Daftar Akun",
}

export default async function RegisterPage() {
  const session = await getSession()
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
          <p className="text-ocean-400 text-sm mt-1">Buat akun baru</p>
        </div>

        <div className="bg-ocean-900 border border-ocean-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6">Daftar sebagai Penulis</h2>
          <RegisterForm />
        </div>

        <p className="text-center text-ocean-500 text-sm mt-6">
          Sudah punya akun?{" "}
          <a href="/login" className="text-gold-400 hover:text-gold-300 font-medium">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  )
}
