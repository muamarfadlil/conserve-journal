"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/Toast"

type ProfileData = {
  name: string
  bio: string
  affiliation: string
  orcidId: string
  avatarUrl: string
}

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const { update } = useSession()
  const { showToast: toast } = useToast()
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(initial.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast("Ukuran foto maksimal 2MB", "error"); return
    }
    if (!file.type.startsWith("image/")) {
      toast("Format file harus gambar (JPG, PNG, WebP)", "error"); return
    }

    setUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onload = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)

      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload gagal")
      const { url } = await res.json()
      setForm(prev => ({ ...prev, avatarUrl: url }))
      setPreviewUrl(url)
      toast("Foto berhasil diunggah", "success")
    } catch {
      toast("Gagal mengunggah foto", "error")
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast("Nama tidak boleh kosong", "error"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }
      await update({ avatarUrl: form.avatarUrl })
      toast("Profil berhasil disimpan", "success")
    } catch (err) {
      toast((err as Error).message || "Gagal menyimpan profil", "error")
    } finally {
      setSaving(false)
    }
  }

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U"
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-ocean-700/60
                          bg-gradient-to-br from-ocean-600 to-ocean-800
                          flex items-center justify-center">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{getInitials(form.name)}</span>
            )}
          </div>
          {uploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
              <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium mb-1">Foto Profil</h3>
          <p className="text-ocean-500 text-sm mb-3">
            Format JPG, PNG, atau WebP. Maksimal 2MB.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-ocean-600
                         text-ocean-300 hover:text-white hover:bg-ocean-800 hover:border-ocean-500
                         transition-all duration-200 disabled:opacity-50"
            >
              {uploadingAvatar ? "Mengunggah..." : "Pilih Foto"}
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={() => { setPreviewUrl(""); setForm(prev => ({ ...prev, avatarUrl: "" })) }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-red-800/60
                           text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all"
              >
                Hapus Foto
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarFile}
            className="hidden"
          />
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-ocean-800 to-transparent" />

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className="block text-xs text-ocean-400 font-medium mb-1.5" htmlFor="name">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full bg-ocean-800/60 border border-ocean-700/60 rounded-xl px-4 py-2.5
                       text-sm text-white placeholder-ocean-600 focus:outline-none
                       focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs text-ocean-400 font-medium mb-1.5" htmlFor="affiliation">
            Institusi / Afiliasi
          </label>
          <input
            id="affiliation"
            name="affiliation"
            value={form.affiliation}
            onChange={handleChange}
            placeholder="Universitas / Lembaga"
            className="w-full bg-ocean-800/60 border border-ocean-700/60 rounded-xl px-4 py-2.5
                       text-sm text-white placeholder-ocean-600 focus:outline-none
                       focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs text-ocean-400 font-medium mb-1.5" htmlFor="orcidId">
            ORCID iD
          </label>
          <input
            id="orcidId"
            name="orcidId"
            value={form.orcidId}
            onChange={handleChange}
            placeholder="0000-0000-0000-0000"
            className="w-full bg-ocean-800/60 border border-ocean-700/60 rounded-xl px-4 py-2.5
                       text-sm text-white placeholder-ocean-600 font-mono focus:outline-none
                       focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500/50 transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-ocean-400 font-medium mb-1.5" htmlFor="bio">
            Bio Singkat
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Ceritakan sedikit tentang Anda, bidang penelitian, atau minat akademis..."
            className="w-full bg-ocean-800/60 border border-ocean-700/60 rounded-xl px-4 py-2.5
                       text-sm text-white placeholder-ocean-600 focus:outline-none resize-none
                       focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500/50 transition-all"
          />
          <p className="text-ocean-700 text-xs mt-1 text-right">{form.bio.length}/500</p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold
                     bg-gradient-to-r from-gold-500 to-gold-400 text-ocean-950
                     hover:shadow-lg hover:shadow-gold-500/20 hover:-translate-y-0.5
                     transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                     disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  )
}
