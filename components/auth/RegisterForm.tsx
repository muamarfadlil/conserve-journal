"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length

  const levels = [
    { label: "Sangat Lemah", color: "bg-red-500",    width: "w-1/4" },
    { label: "Lemah",        color: "bg-orange-500",  width: "w-2/4" },
    { label: "Sedang",       color: "bg-amber-400",   width: "w-3/4" },
    { label: "Kuat",         color: "bg-green-500",   width: "w-full" },
  ]
  if (!password) return null
  const level = levels[score - 1] ?? levels[0]

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1 w-full bg-[var(--bg-surface-alt)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${level.color} ${level.width}`} />
      </div>
      <p className="text-[10px] text-[var(--text-muted)]">{level.label}</p>
    </div>
  )
}

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState("")
  const [success, setSuccess]     = useState("")
  const [loading, setLoading]     = useState(false)

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
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

    setSuccess("Akun berhasil dibuat! Mengarahkan ke halaman login…")
    setTimeout(() => router.push("/login"), 2000)
  }

  const inputCls = "input-auth"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl
                        bg-red-900/30 border border-red-700/60 text-red-300 text-sm animate-scale-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl
                        bg-green-900/30 border border-green-700/60 text-green-300 text-sm animate-scale-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs text-[var(--text-muted)] font-medium" htmlFor="name">
          Nama Lengkap
        </label>
        <input
          id="name" type="text" value={form.name} onChange={update("name")}
          required autoComplete="name" placeholder="Dr. Nama Lengkap"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs text-[var(--text-muted)] font-medium" htmlFor="email">
          Alamat Email
        </label>
        <input
          id="email" type="email" value={form.email} onChange={update("email")}
          required autoComplete="email" placeholder="nama@email.com"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs text-[var(--text-muted)] font-medium" htmlFor="password">
          Password
          <span className="text-[var(--text-muted)] font-normal ml-1">(min. 8 karakter)</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={update("password")}
            required autoComplete="new-password" placeholder="••••••••"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            tabIndex={-1}
            aria-label={showPass ? "Sembunyikan" : "Tampilkan"}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showPass ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </>
              )}
            </svg>
          </button>
        </div>
        <PasswordStrength password={form.password} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs text-[var(--text-muted)] font-medium" htmlFor="confirm">
          Konfirmasi Password
        </label>
        <input
          id="confirm" type="password" value={form.confirm} onChange={update("confirm")}
          required autoComplete="new-password" placeholder="••••••••"
          className={`${inputCls} ${
            form.confirm && form.confirm !== form.password
              ? "border-red-700/60 focus:ring-red-500/40"
              : form.confirm && form.confirm === form.password
              ? "border-green-700/60 focus:ring-green-500/40"
              : ""
          }`}
        />
        {form.confirm && (
          <p className={`text-[10px] ${form.confirm === form.password ? "text-green-500" : "text-red-400"}`}>
            {form.confirm === form.password ? "✓ Password cocok" : "✗ Password tidak cocok"}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm mt-2
                   bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300
                   disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-ocean-700 dark:disabled:to-ocean-700
                   disabled:text-slate-500 dark:disabled:text-ocean-500
                   text-ocean-950 transition-all duration-200
                   hover:shadow-lg hover:shadow-gold-500/20 hover:-translate-y-0.5
                   active:translate-y-0 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Membuat Akun…
          </>
        ) : (
          <>
            Buat Akun
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
