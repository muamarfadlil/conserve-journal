"use client"

import { useEffect } from "react"

interface PreviewData {
  title: string; author: string; affiliate: string; email: string
  abstract: string; introduction: string; methodology: string
  results: string; conclusion: string; references: string
}

export default function JournalPreviewModal({ data, onClose }: { data: PreviewData; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
         onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-100 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Preview Jurnal</span>
            <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full border border-gold-300 font-medium">Layout 2 Kolom</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview content — simulates A4 two-column journal */}
        <div className="overflow-y-auto flex-1 bg-gray-200 p-6">
          <div className="bg-white mx-auto shadow-lg" style={{ width: "210mm", minHeight: "297mm", padding: "20mm 15mm" }}>

            {/* Journal header */}
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-5">
              <p className="text-[8px] tracking-widest uppercase text-gray-500 font-mono">CONSERVE Journal of Community Services</p>
              <p className="text-[7px] text-gray-400 mt-0.5">P-ISSN: 0000-0001 · E-ISSN: 0000-0000</p>
            </div>

            {/* Title block — full width */}
            <h1 className="text-[14px] font-bold text-center text-gray-900 leading-tight mb-3 font-serif">
              {data.title || "Judul Artikel"}
            </h1>
            <p className="text-[9px] text-center text-gray-700 mb-0.5 font-medium">{data.author}</p>
            <p className="text-[8px] text-center text-gray-500 italic mb-0.5">{data.affiliate}</p>
            <p className="text-[8px] text-center text-blue-600 mb-4">{data.email}</p>

            {/* Abstract — full width */}
            <div className="border border-gray-300 p-3 mb-5 bg-gray-50">
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-700 mb-1">Abstrak</p>
              <p className="text-[8px] leading-relaxed text-gray-600 text-justify">{data.abstract}</p>
            </div>

            {/* Two-column body */}
            <div style={{ columnCount: 2, columnGap: "8mm", columnRule: "1px solid #e5e7eb" }}>

              <Section title="1. Pendahuluan" html={data.introduction} />
              <Section title="2. Metodologi" html={data.methodology} />
              <Section title="3. Hasil dan Diskusi" html={data.results} />
              <Section title="4. Kesimpulan" html={data.conclusion} />

              {/* References — full column */}
              <div style={{ breakBefore: "column" }}>
                <p className="text-[8px] font-bold uppercase tracking-wider text-gray-700 mb-1 border-b border-gray-300 pb-0.5">Referensi</p>
                <div className="text-[7.5px] leading-relaxed text-gray-600 journal-content"
                     dangerouslySetInnerHTML={{ __html: data.references }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .journal-content p { margin: 0 0 4px 0; text-align: justify; font-size: 8px; line-height: 1.5; }
        .journal-content h2, .journal-content h3 { font-size: 8px; font-weight: bold; margin: 6px 0 2px; text-transform: uppercase; letter-spacing: 0.05em; }
        .journal-content ul, .journal-content ol { padding-left: 12px; margin: 3px 0; }
        .journal-content li { font-size: 7.5px; margin-bottom: 1px; }
        .journal-content table { width: 100%; border-collapse: collapse; font-size: 7px; margin: 4px 0; }
        .journal-content td, .journal-content th { border: 1px solid #d1d5db; padding: 2px 4px; }
        .journal-content th { background: #f3f4f6; font-weight: bold; }
        .journal-content img { max-width: 100%; height: auto; }
        .journal-content [data-type="mermaid"] { font-size: 7px; }
      `}</style>
    </div>
  )
}

function Section({ title, html }: { title: string; html: string }) {
  if (!html || html === "<p></p>") return null
  return (
    <div style={{ breakInside: "avoid-column" }} className="mb-3">
      <p className="text-[8px] font-bold uppercase tracking-wider text-gray-700 mb-1 border-b border-gray-300 pb-0.5">{title}</p>
      <div className="journal-content" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
