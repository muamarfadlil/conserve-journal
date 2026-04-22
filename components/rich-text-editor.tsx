"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useCallback, useRef } from "react"

interface RichTextEditorProps {
  value: string
  onChange?: (html: string) => void
  placeholder?: string
  readonly?: boolean
  onAddComment?: (text: string, from: number, to: number) => void
  withMermaid?: boolean
  withImage?: boolean
  withTable?: boolean
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis di sini...",
  readonly = false,
  onAddComment,
  withMermaid = false,
  withImage = false,
  withTable = false,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extensions = [
    StarterKit,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder }),
    ...(withImage
      ? [Image.configure({ inline: false, allowBase64: true })]
      : []),
    ...(withTable
      ? [
          Table.configure({ resizable: true }),
          TableRow,
          TableHeader,
          TableCell,
        ]
      : []),
  ]

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Mermaid extension loaded dynamically
  useEffect(() => {
    if (!withMermaid || !editor) return
    import("@/components/mermaid-extension").then(({ MermaidExtension }) => {
      if (!editor.schema.nodes.mermaid) {
        editor.extensionManager.extensions.push(MermaidExtension)
      }
    })
  }, [withMermaid, editor])

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const { url } = await res.json()
    editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const handleAddComment = useCallback(() => {
    if (!onAddComment) return

    if (readonly) {
      // In readonly mode Tiptap sets contenteditable=false so editor.state.selection
      // does NOT track the user's DOM text selection. Use the browser native API instead.
      const sel = window.getSelection()
      const text = sel?.toString().trim()
      if (!text) return
      onAddComment(text, 0, 0)
      sel?.removeAllRanges()
      return
    }

    if (!editor) return
    const { from, to } = editor.state.selection
    if (from === to) return
    const text = editor.state.doc.textBetween(from, to)
    editor.chain().focus().setHighlight({ color: "#fbbf2440" }).run()
    onAddComment(text, from, to)
  }, [editor, readonly, onAddComment])

  if (!editor) return null

  const ToolbarBtn = ({
    onClick, active, title, children,
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        active
          ? "bg-ocean-600 text-white"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  )

  const Sep = () => (
    <div className="w-px h-4 bg-[var(--border-default)] mx-1 flex-shrink-0" />
  )

  return (
    <div className="rte-wrapper border border-[var(--border-default)] rounded-xl overflow-hidden
                    bg-[var(--bg-surface-alt)] focus-within:border-ocean-400 transition-colors">
      {!readonly && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5
                        bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")} title="Bold">
            <strong>B</strong>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")} title="Italic">
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")} title="Strikethrough">
            <s>S</s>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")} title="Inline Code">
            {"</>"}
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarBtn>
          <Sep />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")} title="Bullet List">• List</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")} title="Numbered List">1. List</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")} title="Kutipan">" "</ToolbarBtn>
          <Sep />
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })} title="Rata Kiri">≡L</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })} title="Rata Tengah">≡C</ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })} title="Rata Penuh">≡J</ToolbarBtn>

          {withTable && (
            <>
              <Sep />
              <ToolbarBtn
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                title="Sisipkan Tabel" active={false}>
                Tabel
              </ToolbarBtn>
              {editor.isActive("table") && (
                <>
                  <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Tambah Baris" active={false}>+Baris</ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Tambah Kolom" active={false}>+Kolom</ToolbarBtn>
                  <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Hapus Tabel" active={false}>✕Tabel</ToolbarBtn>
                </>
              )}
            </>
          )}

          {withImage && (
            <>
              <Sep />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
              <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Upload Gambar" active={false}>
                🖼 Gambar
              </ToolbarBtn>
            </>
          )}

          {withMermaid && (
            <>
              <Sep />
              <ToolbarBtn
                onClick={() => editor.chain().focus().insertMermaid?.().run()}
                title="Sisipkan Flowchart" active={false}>
                ⬡ Flowchart
              </ToolbarBtn>
            </>
          )}

          {onAddComment && (
            <>
              <Sep />
              <ToolbarBtn onClick={handleAddComment} title="Tambah Komentar" active={false}>
                💬 Komentar
              </ToolbarBtn>
            </>
          )}
        </div>
      )}

      {readonly && onAddComment && (
        <div className="flex items-center gap-2 px-3 py-1.5
                        bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
          <svg className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] text-[var(--text-muted)] flex-1">
            Pilih teks lalu klik untuk menambah komentar
          </span>
          {/* onMouseDown + preventDefault keeps the text selection alive when button is clicked */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleAddComment() }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg
                       bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400
                       hover:bg-gold-500/20 transition-colors flex-shrink-0">
            💬 Komentar
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="rte-content min-h-[160px] p-4 focus:outline-none
                   [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[136px]"
      />
    </div>
  )
}
