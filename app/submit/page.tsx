"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import JournalPreviewModal from "@/components/JournalPreviewModal"

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), { ssr: false })

const schema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter"),
  author: z.string().min(3, "Nama penulis wajib diisi"),
  affiliate: z.string().min(3, "Afiliasi wajib diisi"),
  correspondence: z.string().min(3, "Korespondensi wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  abstract: z.string().min(50, "Abstrak minimal 50 karakter"),
  introduction: z.string().min(1, "Pendahuluan wajib diisi"),
  methodology: z.string().min(1, "Metodologi wajib diisi"),
  results: z.string().min(1, "Hasil dan Diskusi wajib diisi"),
  conclusion: z.string().min(1, "Kesimpulan wajib diisi"),
  references: z.string().min(1, "Referensi wajib diisi"),
})

type FormValues = z.infer<typeof schema>

const STEPS = [
  { id: "info",    label: "Informasi Dasar", icon: "①" },
  { id: "content", label: "Isi Artikel",     icon: "②" },
  { id: "files",   label: "File & Submit",   icon: "③" },
]

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="bg-ocean-950 min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-ocean-600 border-t-ocean-300 animate-spin" /></div>}>
      <SubmitPageInner />
    </Suspense>
  )
}

function SubmitPageInner() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [step, setStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(editId ? Number(editId) : null)
  const [plagiasiFile, setPlagiasiFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const { control, handleSubmit, getValues, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", author: "", affiliate: "", correspondence: "",
      email: "", abstract: "", introduction: "<p></p>", methodology: "<p></p>",
      results: "<p></p>", conclusion: "<p></p>", references: "<p></p>",
    },
  })

  // Load existing draft for edit mode
  useEffect(() => {
    if (!editId) return
    fetch(`/api/submissions/${editId}`)
      .then(r => r.json())
      .then(data => {
        if (data.id) reset({
          title: data.title, author: data.author, affiliate: data.affiliate,
          correspondence: data.correspondence, email: data.email, abstract: data.abstract,
          introduction: data.introduction, methodology: data.methodology,
          results: data.results, conclusion: data.conclusion, references: data.references,
        })
      })
  }, [editId, reset])

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const { url } = await res.json()
    return url
  }, [])

  const saveToServer = useCallback(async (values: FormValues, status: string) => {
    setSaveStatus("saving")
    const [plagUrl, coverUrl, attUrls] = await Promise.all([
      plagiasiFile ? uploadFile(plagiasiFile) : Promise.resolve(undefined),
      coverLetterFile ? uploadFile(coverLetterFile) : Promise.resolve(undefined),
      Promise.all(attachments.map(uploadFile)),
    ])

    const body = {
      ...values,
      ...(plagUrl && { plagiasiUrl: plagUrl }),
      ...(coverUrl && { coverLetterUrl: coverUrl }),
      ...(attUrls.length && { attachmentUrls: attUrls }),
      status,
      id: savedId,
    }

    const res = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.id) setSavedId(data.id)
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 2000)
    return data.id
  }, [savedId, plagiasiFile, coverLetterFile, attachments, uploadFile])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await saveToServer(values, "SUBMITTED")
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const formValues = watch()

  if (submitted) {
    return (
      <div className="bg-ocean-950 min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Artikel Berhasil Disubmit</h2>
          <p className="text-ocean-400 text-sm">Tim editor akan segera meninjau artikel Anda dan memberikan notifikasi melalui email.</p>
          <div className="flex flex-col gap-2 pt-2">
            <a href="/dashboard/submissions"
              className="px-5 py-2.5 rounded-lg bg-ocean-700 hover:bg-ocean-600 text-white text-sm font-medium transition-colors">
              Lihat Artikel Saya
            </a>
            {savedId && (
              <a href={`/reviewer/${savedId}`}
                className="px-5 py-2.5 rounded-lg border border-ocean-700 hover:border-ocean-500 text-ocean-300 hover:text-white text-sm transition-colors">
                Buka Halaman Reviewer
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ocean-950 min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-ocean-900/90 backdrop-blur-sm border-b border-ocean-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-ocean-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <div>
              <p className="text-white text-sm font-semibold">{editId ? "Edit Artikel" : "Submit Artikel"}</p>
              {savedId && <p className="text-ocean-500 text-[10px] font-mono">ID #{savedId}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && <span className="text-xs text-ocean-500">Menyimpan...</span>}
            {saveStatus === "saved" && <span className="text-xs text-green-500">✓ Tersimpan</span>}
            <button type="button" onClick={() => setShowPreview(true)}
              className="px-3 py-1.5 rounded-lg border border-ocean-700 hover:border-ocean-500 text-ocean-400 hover:text-white text-xs transition-all">
              🔍 Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
              <button type="button" onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  i === step
                    ? "bg-ocean-700/80 text-white ring-1 ring-ocean-500 ring-inset"
                    : i < step
                    ? "bg-ocean-900 text-ocean-300 hover:bg-ocean-800 cursor-pointer"
                    : "bg-ocean-950 text-ocean-600 cursor-default"
                }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < step ? "bg-green-600 text-white" : i === step ? "bg-ocean-500 text-white" : "bg-ocean-900 text-ocean-600"
                }`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? "bg-ocean-600" : "bg-ocean-800"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* STEP 0: Informasi Dasar */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-up">
              <SectionCard title="Identitas Artikel & Penulis">
                <Field label="Judul Artikel *" error={errors.title?.message}>
                  <Controller name="title" control={control} render={({ field }) => (
                    <input {...field} placeholder="Judul lengkap artikel ilmiah..." className={inputCls(!!errors.title)} />
                  )} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nama Penulis *" error={errors.author?.message}>
                    <Controller name="author" control={control} render={({ field }) => (
                      <input {...field} placeholder="Nama lengkap penulis utama" className={inputCls(!!errors.author)} />
                    )} />
                  </Field>
                  <Field label="Afiliasi *" error={errors.affiliate?.message}>
                    <Controller name="affiliate" control={control} render={({ field }) => (
                      <input {...field} placeholder="Universitas / Institusi" className={inputCls(!!errors.affiliate)} />
                    )} />
                  </Field>
                  <Field label="Korespondensi *" error={errors.correspondence?.message}>
                    <Controller name="correspondence" control={control} render={({ field }) => (
                      <input {...field} placeholder="Nama untuk korespondensi" className={inputCls(!!errors.correspondence)} />
                    )} />
                  </Field>
                  <Field label="Email Korespondensi *" error={errors.email?.message}>
                    <Controller name="email" control={control} render={({ field }) => (
                      <input {...field} type="email" placeholder="email@institusi.ac.id" className={inputCls(!!errors.email)} />
                    )} />
                  </Field>
                </div>
                <Field label="Abstrak *" error={errors.abstract?.message}>
                  <Controller name="abstract" control={control} render={({ field }) => (
                    <textarea {...field} rows={5} placeholder="Ringkasan artikel dalam satu paragraf (150–250 kata)..."
                      className={`${inputCls(!!errors.abstract)} resize-y`} />
                  )} />
                  <p className="text-ocean-600 text-xs text-right">{formValues.abstract?.length ?? 0} karakter</p>
                </Field>
              </SectionCard>
              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(1)}
                  className="px-6 py-2.5 rounded-lg bg-ocean-700 hover:bg-ocean-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
                  Lanjut: Isi Artikel
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Isi Artikel */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <SectionCard title="Pendahuluan">
                <Controller name="introduction" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Tulis latar belakang, rumusan masalah, dan tujuan penelitian..." />
                )} />
                {errors.introduction && <p className="text-red-400 text-xs">{errors.introduction.message}</p>}
              </SectionCard>

              <SectionCard title="Metodologi" badge="Flowchart Mermaid">
                <p className="text-xs text-ocean-600 mb-2">Gunakan tombol ⬡ Flowchart untuk menyisipkan diagram alir di dalam teks.</p>
                <Controller name="methodology" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Jelaskan metode, desain penelitian, dan prosedur pengumpulan data..." withMermaid />
                )} />
                {errors.methodology && <p className="text-red-400 text-xs">{errors.methodology.message}</p>}
              </SectionCard>

              <SectionCard title="Hasil dan Diskusi" badge="Gambar & Tabel">
                <Controller name="results" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Paparkan temuan dan analisis hasil penelitian..." withImage withTable />
                )} />
                {errors.results && <p className="text-red-400 text-xs">{errors.results.message}</p>}
              </SectionCard>

              <SectionCard title="Kesimpulan">
                <Controller name="conclusion" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Simpulkan temuan utama dan implikasinya..." />
                )} />
                {errors.conclusion && <p className="text-red-400 text-xs">{errors.conclusion.message}</p>}
              </SectionCard>

              <SectionCard title="Daftar Referensi">
                <Controller name="references" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Tulis daftar pustaka (format APA/Vancouver/IEEE)..." />
                )} />
                {errors.references && <p className="text-red-400 text-xs">{errors.references.message}</p>}
              </SectionCard>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(0)}
                  className="px-5 py-2.5 rounded-lg bg-ocean-900 border border-ocean-700 text-ocean-300 text-sm hover:bg-ocean-800 transition-colors">
                  ← Kembali
                </button>
                <div className="flex gap-2">
                  <button type="button"
                    onClick={async () => { await saveToServer(getValues(), savedId ? "DRAFT" : "DRAFT") }}
                    className="px-4 py-2.5 rounded-lg bg-ocean-900 border border-ocean-700 text-ocean-300 text-sm hover:bg-ocean-800 transition-colors">
                    Simpan Draft
                  </button>
                  <button type="button" onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-lg bg-ocean-700 hover:bg-ocean-600 text-white text-sm font-medium transition-colors flex items-center gap-2">
                    Lanjut: File <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: File & Submit */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-up">
              <SectionCard title="Dokumen Pendukung">
                <div className="space-y-3">
                  <FileUploadField label="Laporan Plagiasi" accept=".pdf,.docx"
                    onChange={(f) => setPlagiasiFile(f?.[0] ?? null)}
                    hint="Hasil cek plagiasi (PDF/DOCX, maks 10MB)" />
                  <FileUploadField label="Cover Letter" accept=".pdf,.docx"
                    onChange={(f) => setCoverLetterFile(f?.[0] ?? null)}
                    hint="Surat pengantar kepada editor (PDF/DOCX)" />
                  <FileUploadField label="Lampiran Tambahan" accept="*" multiple
                    onChange={(f) => setAttachments(Array.from(f ?? []))}
                    hint="Data mentah, gambar HQ, atau file pendukung lainnya" />
                </div>
              </SectionCard>

              <div className="bg-ocean-900/30 border border-ocean-800 rounded-xl p-5 space-y-3">
                <p className="text-white font-semibold text-sm">Pernyataan Penulis</p>
                <div className="space-y-2 text-xs text-ocean-400">
                  {[
                    "Artikel ini merupakan karya orisinal dan belum dipublikasikan di tempat lain",
                    "Semua penulis telah menyetujui untuk submit artikel ini",
                    "Tidak terdapat konflik kepentingan dalam penelitian ini",
                  ].map((s) => (
                    <label key={s} className="flex items-start gap-2 cursor-pointer group">
                      <input type="checkbox" required className="mt-0.5 accent-ocean-500" />
                      <span className="group-hover:text-ocean-300 transition-colors">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-lg bg-ocean-900 border border-ocean-700 text-ocean-300 text-sm hover:bg-ocean-800 transition-colors">
                  ← Kembali
                </button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-ocean-950
                             text-sm font-bold transition-colors disabled:opacity-60 flex items-center gap-2">
                  {submitting ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-ocean-900 border-t-transparent animate-spin" /> Mengirim...</>
                  ) : "Submit Artikel →"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {showPreview && (
        <JournalPreviewModal data={formValues} onClose={() => setShowPreview(false)} />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-ocean-900/30 border border-ocean-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600 flex-shrink-0" />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-ocean-800 border border-ocean-700 text-ocean-400 font-mono">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-ocean-300">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  )
}

function FileUploadField({ label, accept, multiple, onChange, hint }: {
  label: string; accept: string; multiple?: boolean
  onChange: (files: FileList | null) => void; hint: string
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-ocean-300">{label}</label>
      <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed
                        ${fileName ? "border-ocean-600 bg-ocean-900" : "border-ocean-700 hover:border-ocean-500 bg-ocean-950/50"}
                        cursor-pointer transition-colors group`}>
        <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${fileName ? "text-ocean-400" : "text-ocean-600 group-hover:text-ocean-400"}`}
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        <span className={`text-sm flex-1 truncate transition-colors ${fileName ? "text-ocean-300" : "text-ocean-600 group-hover:text-ocean-300"}`}>
          {fileName ?? hint}
        </span>
        {fileName && <span className="text-[10px] text-ocean-500 flex-shrink-0">✓</span>}
        <input type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={(e) => {
            const files = e.target.files
            if (files?.length) setFileName(multiple ? `${files.length} file dipilih` : files[0].name)
            onChange(files)
          }} />
      </label>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full bg-ocean-950 border rounded-lg px-3 py-2.5 text-sm text-white
    placeholder:text-ocean-700 focus:outline-none transition-colors
    ${hasError ? "border-red-500/70 focus:border-red-400" : "border-ocean-800 focus:border-ocean-500"}`
}
