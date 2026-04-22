"use client"

import { useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import dynamic from "next/dynamic"
import { db } from "@/lib/db"
import type { ArticleDraft } from "@/types/article"
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
  { id: "info", label: "Informasi Dasar" },
  { id: "content", label: "Isi Artikel" },
  { id: "files", label: "File & Submit" },
]

export default function SubmitPage() {
  const [step, setStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [plagiasiFile, setPlagiasiFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { control, handleSubmit, getValues, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", author: "", affiliate: "", correspondence: "",
      email: "", abstract: "", introduction: "", methodology: "",
      results: "", conclusion: "", references: "",
    },
  })

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const { url } = await res.json()
    return url
  }, [])

  const saveDraft = useCallback(async (values: FormValues, status: ArticleDraft["status"] = "draft") => {
    const now = Date.now()
    const [plagUrl, coverUrl, attUrls] = await Promise.all([
      plagiasiFile ? uploadFile(plagiasiFile) : Promise.resolve(undefined),
      coverLetterFile ? uploadFile(coverLetterFile) : Promise.resolve(undefined),
      Promise.all(attachments.map(uploadFile)),
    ])

    const draft: ArticleDraft = {
      ...values,
      plagiasiFile: plagUrl,
      coverLetterFile: coverUrl,
      attachments: attUrls,
      comments: [],
      status,
      createdAt: now,
      updatedAt: now,
    }

    if (savedId) {
      await db.drafts.update(savedId, { ...draft, updatedAt: now })
      return savedId
    } else {
      const id = await db.drafts.add(draft)
      setSavedId(Number(id))
      return Number(id)
    }
  }, [savedId, plagiasiFile, coverLetterFile, attachments, uploadFile])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await saveDraft(values, "submitted")
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const formValues = watch()

  if (submitted) {
    return (
      <div className="bg-ocean-950 min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-ocean-800 border border-ocean-600 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-ocean-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Artikel Berhasil Disubmit</h2>
          <p className="text-ocean-400 text-sm">Tim editor akan meninjau artikel Anda.</p>
          <div className="flex gap-3 justify-center pt-2">
            <a href="/" className="px-4 py-2 rounded-lg bg-ocean-800 border border-ocean-700 text-sm text-white hover:bg-ocean-700 transition-colors">
              Kembali ke Beranda
            </a>
            {savedId && (
              <a href={`/reviewer/${savedId}`} className="px-4 py-2 rounded-lg bg-gold-500 text-ocean-950 text-sm font-semibold hover:bg-gold-400 transition-colors">
                Lihat di Reviewer
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ocean-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono text-ocean-500 uppercase tracking-widest mb-1">CONSERVE Journal</p>
          <h1 className="text-3xl font-serif font-bold text-white">Submit Artikel</h1>
          <p className="text-ocean-400 text-sm mt-1">Isi semua bagian sebelum mengirim naskah Anda.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  i === step
                    ? "bg-ocean-700 text-white ring-1 ring-ocean-500"
                    : i < step
                    ? "bg-ocean-900 text-ocean-300 hover:bg-ocean-800"
                    : "bg-ocean-900/50 text-ocean-600 cursor-default"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  i < step ? "bg-ocean-500 text-white" : i === step ? "bg-ocean-500 text-white" : "bg-ocean-800 text-ocean-600"
                }`}>{i + 1}</span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-ocean-800" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* STEP 0: Informasi Dasar */}
          {step === 0 && (
            <div className="space-y-5">
              <SectionCard title="Informasi Penulis">
                <Field label="Judul Artikel" error={errors.title?.message}>
                  <Controller name="title" control={control} render={({ field }) => (
                    <input {...field} placeholder="Judul lengkap artikel..." className={inputCls(!!errors.title)} />
                  )} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nama Penulis" error={errors.author?.message}>
                    <Controller name="author" control={control} render={({ field }) => (
                      <input {...field} placeholder="Nama lengkap penulis" className={inputCls(!!errors.author)} />
                    )} />
                  </Field>
                  <Field label="Afiliasi" error={errors.affiliate?.message}>
                    <Controller name="affiliate" control={control} render={({ field }) => (
                      <input {...field} placeholder="Institusi / Universitas" className={inputCls(!!errors.affiliate)} />
                    )} />
                  </Field>
                  <Field label="Korespondensi" error={errors.correspondence?.message}>
                    <Controller name="correspondence" control={control} render={({ field }) => (
                      <input {...field} placeholder="Nama untuk korespondensi" className={inputCls(!!errors.correspondence)} />
                    )} />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <Controller name="email" control={control} render={({ field }) => (
                      <input {...field} type="email" placeholder="email@institusi.ac.id" className={inputCls(!!errors.email)} />
                    )} />
                  </Field>
                </div>
                <Field label="Abstrak" error={errors.abstract?.message}>
                  <Controller name="abstract" control={control} render={({ field }) => (
                    <textarea {...field} rows={5} placeholder="Ringkasan artikel (150–250 kata)..."
                      className={`${inputCls(!!errors.abstract)} resize-y`} />
                  )} />
                </Field>
              </SectionCard>

              <div className="flex justify-end">
                <button type="button" onClick={() => setStep(1)}
                  className="px-6 py-2.5 rounded-lg bg-ocean-700 hover:bg-ocean-600 text-white text-sm font-medium transition-colors">
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Isi Artikel */}
          {step === 1 && (
            <div className="space-y-6">
              <SectionCard title="Pendahuluan">
                <Controller name="introduction" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Tulis latar belakang dan tujuan penelitian..." />
                )} />
                {errors.introduction && <p className="text-red-400 text-xs mt-1">{errors.introduction.message}</p>}
              </SectionCard>

              <SectionCard title="Metodologi" badge="Flowchart">
                <p className="text-xs text-ocean-500 mb-2">Gunakan tombol ⬡ Flowchart di toolbar untuk menyisipkan diagram alir Mermaid.</p>
                <Controller name="methodology" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Jelaskan metodologi penelitian..." withMermaid />
                )} />
                {errors.methodology && <p className="text-red-400 text-xs mt-1">{errors.methodology.message}</p>}
              </SectionCard>

              <SectionCard title="Hasil dan Diskusi" badge="Gambar & Tabel">
                <Controller name="results" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Paparkan hasil dan analisis..." withImage withTable />
                )} />
                {errors.results && <p className="text-red-400 text-xs mt-1">{errors.results.message}</p>}
              </SectionCard>

              <SectionCard title="Kesimpulan">
                <Controller name="conclusion" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Tulis kesimpulan penelitian..." />
                )} />
                {errors.conclusion && <p className="text-red-400 text-xs mt-1">{errors.conclusion.message}</p>}
              </SectionCard>

              <SectionCard title="Referensi">
                <Controller name="references" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Daftar pustaka (format APA/IEEE)..." />
                )} />
                {errors.references && <p className="text-red-400 text-xs mt-1">{errors.references.message}</p>}
              </SectionCard>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(0)}
                  className="px-5 py-2.5 rounded-lg bg-ocean-900 border border-ocean-700 text-ocean-300 text-sm hover:bg-ocean-800 transition-colors">
                  ← Kembali
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { saveDraft(getValues(), "draft") }}
                    className="px-5 py-2.5 rounded-lg bg-ocean-900 border border-ocean-700 text-ocean-300 text-sm hover:bg-ocean-800 transition-colors">
                    Simpan Draft
                  </button>
                  <button type="button" onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-lg bg-ocean-700 hover:bg-ocean-600 text-white text-sm font-medium transition-colors">
                    Lanjut →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: File & Submit */}
          {step === 2 && (
            <div className="space-y-5">
              <SectionCard title="Upload File">
                <div className="space-y-4">
                  <FileUploadField label="Laporan Plagiasi" accept=".pdf,.docx"
                    onChange={(f) => setPlagiasiFile(f?.[0] ?? null)}
                    hint="PDF atau DOCX, maks 10MB" />
                  <FileUploadField label="Cover Letter" accept=".pdf,.docx"
                    onChange={(f) => setCoverLetterFile(f?.[0] ?? null)}
                    hint="PDF atau DOCX, maks 5MB" />
                  <FileUploadField label="Lampiran Tambahan" accept="*" multiple
                    onChange={(f) => setAttachments(Array.from(f ?? []))}
                    hint="Boleh lebih dari satu file" />
                </div>
              </SectionCard>

              {/* Preview toggle */}
              <div className="p-4 bg-ocean-900/50 border border-ocean-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Preview Jurnal</p>
                  <p className="text-ocean-500 text-xs mt-0.5">Lihat tampilan layout dua kolom seperti jurnal cetak</p>
                </div>
                <button type="button" onClick={() => setShowPreview(true)}
                  className="px-4 py-2 rounded-lg bg-ocean-800 border border-ocean-700 hover:border-ocean-500 text-ocean-300 hover:text-white text-sm transition-all">
                  🔍 Preview
                </button>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-lg bg-ocean-900 border border-ocean-700 text-ocean-300 text-sm hover:bg-ocean-800 transition-colors">
                  ← Kembali
                </button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-ocean-950 text-sm font-bold transition-colors disabled:opacity-60">
                  {submitting ? "Mengirim..." : "Submit Artikel"}
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-ocean-900/40 border border-ocean-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600" />
        <h2 className="text-white font-semibold">{title}</h2>
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
      <label className="block text-sm text-ocean-300 font-medium">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

function FileUploadField({ label, accept, multiple, onChange, hint }: {
  label: string; accept: string; multiple?: boolean
  onChange: (files: FileList | null) => void; hint: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-ocean-300 font-medium">{label}</label>
      <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-ocean-700
                        hover:border-ocean-500 bg-ocean-950/50 cursor-pointer transition-colors group">
        <svg className="w-5 h-5 text-ocean-600 group-hover:text-ocean-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className="text-sm text-ocean-500 group-hover:text-ocean-300 transition-colors">{hint}</span>
        <input type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={(e) => onChange(e.target.files)} />
      </label>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full bg-ocean-950 border rounded-lg px-3 py-2.5 text-sm text-white
    placeholder:text-ocean-600 focus:outline-none transition-colors
    ${hasError ? "border-red-500 focus:border-red-400" : "border-ocean-700 focus:border-ocean-500"}`
}
