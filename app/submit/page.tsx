"use client"

import { useState, useCallback, useEffect, useRef, Suspense } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import JournalPreviewModal from "@/components/JournalPreviewModal"

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), { ssr: false })

const schema = z.object({
  title:          z.string().min(10, "Judul minimal 10 karakter"),
  author:         z.string().min(3,  "Nama penulis wajib diisi"),
  affiliate:      z.string().min(3,  "Afiliasi wajib diisi"),
  correspondence: z.string().min(3,  "Korespondensi wajib diisi"),
  email:          z.string().email(  "Format email tidak valid"),
  keywords:       z.string().optional(),
  abstract:       z.string().min(50, "Abstrak minimal 50 karakter"),
  introduction:   z.string().min(1,  "Pendahuluan wajib diisi"),
  methodology:    z.string().min(1,  "Metodologi wajib diisi"),
  results:        z.string().min(1,  "Hasil dan Diskusi wajib diisi"),
  conclusion:     z.string().min(1,  "Kesimpulan wajib diisi"),
  references:     z.string().min(1,  "Referensi wajib diisi"),
})

type FormValues = z.infer<typeof schema>

// Fields validated at each step — prevents reaching step 3 with empty required fields
const STEP_FIELDS: (keyof FormValues)[][] = [
  ["title", "author", "affiliate", "correspondence", "email", "abstract"],
  ["introduction", "methodology", "results", "conclusion", "references"],
]

const STEPS = [
  { id: "info",    label: "Informasi Dasar" },
  { id: "content", label: "Isi Artikel" },
  { id: "files",   label: "File & Submit" },
]

export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 rounded-full border-2 border-ocean-400 border-t-transparent animate-spin" />
      </div>
    }>
      <SubmitPageInner />
    </Suspense>
  )
}

function SubmitPageInner() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [step, setStep]           = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [savedId, setSavedId]     = useState<number | null>(editId ? Number(editId) : null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Track files and their already-uploaded URLs to avoid re-uploading on each save
  const [plagiasiFile, setPlagiasiFile]     = useState<File | null>(null)
  const [plagiasiUrl, setPlagiasiUrl]       = useState<string | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null)
  const [attachments, setAttachments]       = useState<File[]>([])
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])

  const { control, handleSubmit, getValues, watch, reset, trigger,
          formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", author: "", affiliate: "", correspondence: "",
      email: "", keywords: "", abstract: "",
      introduction: "<p></p>", methodology: "<p></p>",
      results: "<p></p>", conclusion: "<p></p>", references: "<p></p>",
    },
  })

  // Load existing draft in edit mode
  useEffect(() => {
    if (!editId) return
    fetch(`/api/submissions/${editId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.id) reset({
          title: data.title, author: data.author, affiliate: data.affiliate,
          correspondence: data.correspondence, email: data.email,
          keywords: Array.isArray(data.keywords) ? data.keywords.join(", ") : "",
          abstract: data.abstract,
          introduction: data.introduction, methodology: data.methodology,
          results: data.results, conclusion: data.conclusion, references: data.references,
        })
        if (data.plagiasiUrl)    setPlagiasiUrl(data.plagiasiUrl)
        if (data.coverLetterUrl) setCoverLetterUrl(data.coverLetterUrl)
        if (data.attachmentUrls?.length) setAttachmentUrls(data.attachmentUrls)
      })
      .catch(() => {}) // ignore load error — user will see empty form
  }, [editId, reset])

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) throw new Error(`Gagal mengunggah ${file.name}`)
    const json = await res.json()
    if (!json.url) throw new Error(`Respons upload tidak valid untuk ${file.name}`)
    return json.url as string
  }, [])

  const saveToServer = useCallback(async (values: FormValues, status: string): Promise<number> => {
    setSaveStatus("saving")
    setSaveError(null)

    try {
      // Only upload files that haven't been uploaded yet
      const [newPlagUrl, newCoverUrl, newAttUrls] = await Promise.all([
        plagiasiFile && !plagiasiUrl  ? uploadFile(plagiasiFile)         : Promise.resolve(null),
        coverLetterFile && !coverLetterUrl ? uploadFile(coverLetterFile) : Promise.resolve(null),
        attachments.length && !attachmentUrls.length ? Promise.all(attachments.map(uploadFile)) : Promise.resolve(null),
      ])

      // Persist uploaded URLs in state to avoid re-uploading
      if (newPlagUrl)   setPlagiasiUrl(newPlagUrl)
      if (newCoverUrl)  setCoverLetterUrl(newCoverUrl)
      if (newAttUrls)   setAttachmentUrls(newAttUrls)

      const body = {
        ...values,
        keywords: values.keywords
          ? values.keywords.split(",").map(k => k.trim()).filter(Boolean)
          : [],
        plagiasiUrl:    newPlagUrl    ?? plagiasiUrl    ?? undefined,
        coverLetterUrl: newCoverUrl   ?? coverLetterUrl ?? undefined,
        attachmentUrls: newAttUrls    ?? (attachmentUrls.length ? attachmentUrls : undefined),
        status,
        id: savedId,
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan ke server")

      if (data.id) setSavedId(data.id)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2500)
      return data.id
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan"
      setSaveError(msg)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
      throw err
    }
  }, [savedId, plagiasiFile, plagiasiUrl, coverLetterFile, coverLetterUrl,
      attachments, attachmentUrls, uploadFile])

  const goToStep = useCallback(async (target: number) => {
    if (target <= step) { setStep(target); return }
    // Validate current step's fields before advancing
    const fields = STEP_FIELDS[step]
    if (fields) {
      const ok = await trigger(fields)
      if (!ok) return
    }
    setStep(target)
  }, [step, trigger])

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await saveToServer(values, "SUBMITTED")
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim artikel. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  const formValues = watch()

  const abstractWords = formValues.abstract?.trim().split(/\s+/).filter(Boolean).length ?? 0

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
        <div className="w-full max-w-md space-y-6">
          {/* Icon */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700
                            flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
              Artikel Berhasil Disubmit!
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-2">
              Nomor submission: <span className="font-mono font-semibold text-[var(--text-primary)]">#{savedId}</span>
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Proses Selanjutnya</p>
            {[
              { icon: "✉", label: "Konfirmasi email",        desc: "Anda akan menerima email konfirmasi dalam beberapa menit" },
              { icon: "👁", label: "Review editorial",        desc: "Editor akan memeriksa kelengkapan dan kesesuaian submission" },
              { icon: "🔬", label: "Review substansi",        desc: "Artikel diteruskan ke reviewer ahli (2–4 minggu)" },
              { icon: "📋", label: "Keputusan editor",        desc: "Diterima, revisi, atau ditolak beserta catatan lengkap" },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-default)]
                                flex items-center justify-center text-sm flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-[var(--text-primary)] text-xs font-medium">{s.label}</p>
                  <p className="text-[var(--text-muted)] text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <a href="/dashboard/submissions"
              className="w-full text-center px-5 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-500
                         text-white text-sm font-semibold transition-colors">
              Lihat Status Submission Saya
            </a>
            <a href="/submit"
              className="w-full text-center px-5 py-2.5 rounded-xl border border-[var(--border-default)]
                         hover:border-ocean-400 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                         text-sm transition-colors">
              Submit Artikel Baru
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[var(--bg-surface-alt)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <div>
              <p className="text-[var(--text-primary)] text-sm font-semibold">{editId ? "Edit Artikel" : "Submit Artikel"}</p>
              {savedId && <p className="text-[var(--text-muted)] text-[10px] font-mono">ID #{savedId}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan…
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tersimpan
              </span>
            )}
            {saveStatus === "error" && saveError && (
              <span className="text-xs text-red-500 dark:text-red-400 max-w-[200px] truncate" title={saveError}>
                ⚠ {saveError}
              </span>
            )}
            <button type="button" onClick={() => setShowPreview(true)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-default)] hover:border-ocean-400
                         text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs transition-all">
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => goToStep(i)}
                disabled={i > step + 1}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  i === step
                    ? "bg-ocean-600/20 dark:bg-ocean-700/40 text-ocean-700 dark:text-ocean-300 ring-1 ring-ocean-500/50 ring-inset"
                    : i < step
                    ? "bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer"
                    : "text-[var(--text-muted)] cursor-default opacity-50"
                }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < step
                    ? "bg-green-500 dark:bg-green-600 text-white"
                    : i === step
                    ? "bg-ocean-500 text-white"
                    : "bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"
                }`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px transition-colors ${i < step ? "bg-ocean-500" : "bg-[var(--border-default)]"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── STEP 0: Informasi Dasar ─────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-up">
              <SectionCard title="Identitas Artikel & Penulis"
                hint="Pastikan nama dan afiliasi sesuai dengan identitas resmi Anda.">

                <Field label="Judul Artikel *" error={errors.title?.message}
                  hint="Gunakan judul yang spesifik dan informatif (min. 10 karakter)">
                  <Controller name="title" control={control} render={({ field }) => (
                    <input {...field} placeholder="Contoh: Efektivitas Program Konservasi Mangrove terhadap Keanekaragaman Hayati..."
                           className={inputCls(!!errors.title)} />
                  )} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nama Penulis Utama *" error={errors.author?.message}>
                    <Controller name="author" control={control} render={({ field }) => (
                      <input {...field} placeholder="Dr. Nama Lengkap, M.Si."
                             className={inputCls(!!errors.author)} />
                    )} />
                  </Field>
                  <Field label="Afiliasi / Institusi *" error={errors.affiliate?.message}>
                    <Controller name="affiliate" control={control} render={({ field }) => (
                      <input {...field} placeholder="Universitas / Lembaga Penelitian"
                             className={inputCls(!!errors.affiliate)} />
                    )} />
                  </Field>
                  <Field label="Nama Korespondensi *" error={errors.correspondence?.message}
                    hint="Nama yang akan dihubungi editor">
                    <Controller name="correspondence" control={control} render={({ field }) => (
                      <input {...field} placeholder="Nama lengkap untuk korespondensi"
                             className={inputCls(!!errors.correspondence)} />
                    )} />
                  </Field>
                  <Field label="Email Korespondensi *" error={errors.email?.message}>
                    <Controller name="email" control={control} render={({ field }) => (
                      <input {...field} type="email" placeholder="nama@institusi.ac.id"
                             className={inputCls(!!errors.email)} />
                    )} />
                  </Field>
                </div>

                <Field label="Kata Kunci" error={errors.keywords?.message}
                  hint="Pisahkan dengan koma — maks 6 kata kunci (contoh: konservasi, ekologi laut, mangrove)">
                  <Controller name="keywords" control={control} render={({ field }) => (
                    <input {...field} placeholder="konservasi, ekologi laut, keanekaragaman hayati"
                           className={inputCls(!!errors.keywords)} />
                  )} />
                </Field>

                <Field label="Abstrak *" error={errors.abstract?.message}
                  hint="Ringkasan singkat mencakup tujuan, metode, hasil, dan kesimpulan (150–250 kata)">
                  <Controller name="abstract" control={control} render={({ field }) => (
                    <textarea {...field} rows={6}
                      placeholder="Penelitian ini bertujuan untuk... Metode yang digunakan... Hasil menunjukkan... Disimpulkan bahwa..."
                      className={`${inputCls(!!errors.abstract)} resize-y`} />
                  )} />
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${
                      abstractWords < 150 ? "text-amber-600 dark:text-amber-400"
                      : abstractWords > 250 ? "text-red-500"
                      : "text-green-600 dark:text-green-400"
                    }`}>
                      {abstractWords} kata
                      {abstractWords < 150 && abstractWords > 0 && " — min. 150 kata"}
                      {abstractWords > 250 && " — max. 250 kata disarankan"}
                      {abstractWords >= 150 && abstractWords <= 250 && " ✓"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{formValues.abstract?.length ?? 0} karakter</span>
                  </div>
                </Field>
              </SectionCard>

              <div className="flex justify-end">
                <button type="button" onClick={() => goToStep(1)}
                  className="px-6 py-2.5 rounded-lg bg-ocean-600 hover:bg-ocean-500 text-white
                             text-sm font-medium transition-colors flex items-center gap-2">
                  Lanjut: Isi Artikel
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 1: Isi Artikel ──────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <div className="p-4 rounded-xl bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 text-xs text-ocean-700 dark:text-ocean-400">
                <strong>Tips penulisan:</strong> Gunakan heading (H2/H3), tabel, dan gambar di toolbar editor untuk artikel yang lebih terstruktur.
                Untuk flowchart metodologi, gunakan tombol ⬡ Flowchart pada bagian Metodologi.
              </div>

              <SectionCard title="Pendahuluan"
                hint="Latar belakang, rumusan masalah, tujuan, dan urgensi penelitian">
                <Controller name="introduction" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Tulis latar belakang, rumusan masalah, dan tujuan penelitian..." />
                )} />
                {errors.introduction && <FieldError message={errors.introduction.message!} />}
              </SectionCard>

              <SectionCard title="Metodologi" badge="Flowchart Mermaid"
                hint="Desain penelitian, populasi/sampel, teknik pengumpulan dan analisis data">
                <Controller name="methodology" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Jelaskan metode, desain penelitian, dan prosedur pengumpulan data..."
                    withMermaid />
                )} />
                {errors.methodology && <FieldError message={errors.methodology.message!} />}
              </SectionCard>

              <SectionCard title="Hasil dan Diskusi" badge="Gambar & Tabel"
                hint="Temuan utama, analisis, dan perbandingan dengan penelitian sebelumnya">
                <Controller name="results" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Paparkan temuan dan analisis hasil penelitian..."
                    withImage withTable />
                )} />
                {errors.results && <FieldError message={errors.results.message!} />}
              </SectionCard>

              <SectionCard title="Kesimpulan"
                hint="Simpulan berdasarkan tujuan penelitian, implikasi, dan saran">
                <Controller name="conclusion" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Simpulkan temuan utama dan implikasinya..." />
                )} />
                {errors.conclusion && <FieldError message={errors.conclusion.message!} />}
              </SectionCard>

              <SectionCard title="Daftar Referensi"
                hint="Format APA 7th, Vancouver, atau IEEE — minimal 15 referensi direkomendasikan">
                <Controller name="references" control={control} render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange}
                    placeholder="Tulis daftar pustaka (format APA/Vancouver/IEEE)..." />
                )} />
                {errors.references && <FieldError message={errors.references.message!} />}
              </SectionCard>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(0)}
                  className="px-5 py-2.5 rounded-lg border border-[var(--border-default)]
                             text-[var(--text-secondary)] text-sm hover:border-ocean-400 transition-colors
                             flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali
                </button>
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => saveToServer(getValues(), "DRAFT")}
                    className="px-4 py-2.5 rounded-lg border border-[var(--border-default)]
                               text-[var(--text-secondary)] text-sm hover:border-ocean-400 transition-colors">
                    Simpan Draft
                  </button>
                  <button type="button" onClick={() => goToStep(2)}
                    className="px-6 py-2.5 rounded-lg bg-ocean-600 hover:bg-ocean-500 text-white
                               text-sm font-medium transition-colors flex items-center gap-2">
                    Lanjut: File
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: File & Submit ────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-up">
              <SectionCard title="Dokumen Pendukung"
                hint="Semua file bersifat opsional namun sangat disarankan untuk mempercepat proses review.">
                <div className="space-y-4">
                  <FileUploadField
                    label="Laporan Plagiasi"
                    accept=".pdf,.docx"
                    hint="Hasil cek plagiasi dari Turnitin/iThenticate (PDF/DOCX, maks 10MB)"
                    uploaded={!!plagiasiUrl}
                    onChange={(f) => { setPlagiasiFile(f?.[0] ?? null); setPlagiasiUrl(null) }}
                  />
                  <FileUploadField
                    label="Cover Letter"
                    accept=".pdf,.docx"
                    hint="Surat pengantar kepada editor (PDF/DOCX)"
                    uploaded={!!coverLetterUrl}
                    onChange={(f) => { setCoverLetterFile(f?.[0] ?? null); setCoverLetterUrl(null) }}
                  />
                  <FileUploadField
                    label="Lampiran Tambahan"
                    accept="*/*"
                    multiple
                    hint="Data mentah, gambar resolusi tinggi, atau file pendukung lainnya"
                    uploaded={attachmentUrls.length > 0 && attachments.length === 0}
                    onChange={(f) => { setAttachments(Array.from(f ?? [])); setAttachmentUrls([]) }}
                  />
                </div>
              </SectionCard>

              {/* Author declaration */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-[var(--text-primary)] font-semibold text-sm">Pernyataan Penulis</p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">
                    Centang semua pernyataan di bawah ini sebelum submit.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    "Artikel ini merupakan karya orisinal dan belum pernah dipublikasikan atau sedang dalam proses review di jurnal lain.",
                    "Semua penulis yang tercantum telah membaca, menyetujui, dan berkontribusi nyata pada artikel ini.",
                    "Tidak terdapat konflik kepentingan finansial maupun non-finansial dalam penelitian ini.",
                    "Saya memahami bahwa submission ini akan melalui proses peer-review dan keputusan editor bersifat final.",
                  ].map((s) => (
                    <label key={s} className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" required
                        className="mt-0.5 w-4 h-4 rounded accent-ocean-600 cursor-pointer flex-shrink-0" />
                      <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-relaxed">
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary card */}
              <div className="bg-[var(--bg-surface-alt)] border border-[var(--border-default)] rounded-xl p-4">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Ringkasan Submission</p>
                <dl className="space-y-1.5 text-xs">
                  {[
                    { label: "Judul",    value: formValues.title || "—" },
                    { label: "Penulis",  value: formValues.author || "—" },
                    { label: "Afiliasi", value: formValues.affiliate || "—" },
                    { label: "Email",    value: formValues.email || "—" },
                    { label: "Abstrak",  value: `${abstractWords} kata` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-2">
                      <dt className="text-[var(--text-muted)] w-20 flex-shrink-0">{label}</dt>
                      <dd className="text-[var(--text-primary)] font-medium line-clamp-1 flex-1">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {submitError && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20
                                border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {submitError}
                </div>
              )}

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-lg border border-[var(--border-default)]
                             text-[var(--text-secondary)] text-sm hover:border-ocean-400 transition-colors
                             flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Kembali
                </button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-ocean-950
                             text-sm font-bold transition-all disabled:opacity-60 flex items-center gap-2
                             hover:shadow-lg hover:shadow-gold-500/20 hover:-translate-y-0.5 active:translate-y-0">
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengirim…
                    </>
                  ) : (
                    <>
                      Submit Artikel
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
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

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, badge, hint, children }: {
  title: string; badge?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-ocean-400 to-ocean-600 flex-shrink-0" />
          <h2 className="text-[var(--text-primary)] font-semibold text-sm">{title}</h2>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-default)] text-[var(--text-muted)] font-mono">
              {badge}
            </span>
          )}
        </div>
        {hint && <p className="text-xs text-[var(--text-muted)] pl-3">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
        {hint && <p className="text-xs text-[var(--text-muted)] mt-0.5">{hint}</p>}
      </div>
      {children}
      {error && <FieldError message={error} />}
    </div>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {message}
    </p>
  )
}

function FileUploadField({ label, accept, multiple, onChange, hint, uploaded }: {
  label: string; accept: string; multiple?: boolean; hint: string; uploaded?: boolean
  onChange: (files: FileList | null) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFile = !!fileName || uploaded

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all
                    ${hasFile
                      ? "border-ocean-400 bg-ocean-50 dark:bg-ocean-900/20"
                      : "border-[var(--border-default)] hover:border-ocean-400 bg-[var(--bg-surface-alt)]"
                    }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          hasFile ? "bg-ocean-100 dark:bg-ocean-800 text-ocean-600 dark:text-ocean-400" : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
        }`}>
          {hasFile ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate transition-colors ${
            hasFile ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-muted)]"
          }`}>
            {fileName ?? (uploaded ? "File tersimpan dari draft sebelumnya" : hint)}
          </p>
          {!hasFile && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Klik untuk memilih file</p>
          )}
        </div>
        {hasFile && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setFileName(null)
              onChange(null)
              if (inputRef.current) inputRef.current.value = ""
            }}
            className="text-[var(--text-muted)] hover:text-red-500 transition-colors flex-shrink-0"
            title="Hapus file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            const files = e.target.files
            if (files?.length) {
              setFileName(multiple ? `${files.length} file dipilih` : files[0].name)
            } else {
              setFileName(null)
            }
            onChange(files)
          }}
        />
      </div>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return [
    "w-full bg-[var(--bg-surface-alt)] border rounded-xl px-3 py-2.5 text-sm",
    "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
    "focus:outline-none transition-colors",
    hasError
      ? "border-red-400 dark:border-red-600 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
      : "border-[var(--border-default)] focus:border-ocean-400 focus:ring-2 focus:ring-ocean-400/20",
  ].join(" ")
}
