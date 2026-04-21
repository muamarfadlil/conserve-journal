"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (form.password !== form.confirm) {
      setError("Password dan konfirmasi password tidak cocok.")
      return
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? "Pendaftaran gagal. Silakan coba lagi.")
      return
    }

    setSuccess("Akun berhasil dibuat! Mengarahkan ke halaman login...")
    setTimeout(() => router.push("/login"), 2000)
  }

  const fields = [
    { key: "name" as const, label: "Nama Lengkap", type: "text", placeholder: "Dr. Nama Lengkap", autoComplete: "name" },
    { key: "email" as const, label: "Email", type: "email", placeholder: "nama@email.com", autoComplete: "email" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-900/30 border border-green-700 text-green-400 text-sm">
          {success}
        </div>
      )}

      {fields.map(({ key, label, type, placeholder, autoComplete }) => (
        <div key={key}>
          <label className="block text-sm text-ocean-300 mb-1.5" htmlFor={key}>
            {label}
          </label>
          <input
            id={key}
            type={type}
            value={form[key]}
            onChange={update(key)}
            required
            autoComplete={autoComplete}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-ocean-800 border border-ocean-700 rounded-lg
                       text-white placeholder-ocean-600 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent
                       transition-colors"
          />
        </div>
      ))}

      {/* Password */}
      <div>
        <label className="block text-sm text-ocean-300 mb-1.5" htmlFor="password">
          Password <span className="text-ocean-600">(min. 8 karakter)</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={update("password")}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-ocean-800 border border-ocean-700 rounded-lg
                       text-white placeholder-ocean-600 text-sm pr-11
                       focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent
                       transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-500 hover:text-ocean-300"
            tabIndex={-1}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Konfirmasi Password */}
      <div>
        <label className="block text-sm text-ocean-300 mb-1.5" htmlFor="confirm">
          Konfirmasi Password
        </label>
        <input
          id="confirm"
          type="password"
          value={form.confirm}
          onChange={update("confirm")}
          required
          autoComplete="new-password"
          placeholder="••••••••"
          className="w-full px-4 py-2.5 bg-ocean-800 border border-ocean-700 rounded-lg
                     text-white placeholder-ocean-600 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent
                     transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-gold-500 hover:bg-gold-400 disabled:bg-ocean-700
                   disabled:text-ocean-500 text-ocean-950 font-semibold text-sm rounded-lg
                   transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Mendaftar...
          </>
        ) : (
          "Buat Akun"
        )}
      </button>
    </form>
  )
}
