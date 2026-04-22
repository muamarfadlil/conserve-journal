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
      // Only register if not already registered
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

  // Comment: highlight selection and bubble callback
  const handleAddComment = useCallback(() => {
    if (!editor || !onAddComment) return
    const { from, to } = editor.state.selection
    if (from === to) return
    const text = editor.state.doc.textBetween(from, to)
    editor.chain().focus().setHighlight({ color: "#fbbf2440" }).run()
    onAddComment(text, from, to)
  }, [editor, onAddComment])

  if (!editor) return null

  const ToolbarButton = ({
    onClick, active, title, children,
  }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-xs transition-colors ${
        active
          ? "bg-ocean-600 text-white"
          : "text-ocean-300 hover:bg-ocean-800 hover:text-white"
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-ocean-700 rounded-xl overflow-hidden bg-ocean-950 focus-within:border-ocean-500 transition-colors">
      {!readonly && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-ocean-900 border-b border-ocean-800">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")} title="Bold">B</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")} title="Italic"><em>I</em></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")} title="Bullet List">• List</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")} title="Numbered List">1. List</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")} title="Quote">" "</ToolbarButton>
          <div className="w-px h-4 bg-ocean-700 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })} title="Rata Kiri">≡L</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })} title="Rata Tengah">≡C</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })} title="Rata Kanan-Kiri">≡J</ToolbarButton>

          {withTable && (
            <>
              <div className="w-px h-4 bg-ocean-700 mx-1" />
              <ToolbarButton
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                title="Insert Table" active={false}>
                Tabel
              </ToolbarButton>
              {editor.isActive("table") && (
                <>
                  <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Tambah Baris" active={false}>+Baris</ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Tambah Kolom" active={false}>+Kolom</ToolbarButton>
                  <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Hapus Tabel" active={false}>✕Tabel</ToolbarButton>
                </>
              )}
            </>
          )}

          {withImage && (
            <>
              <div className="w-px h-4 bg-ocean-700 mx-1" />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
              <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Upload Gambar" active={false}>
                🖼 Gambar
              </ToolbarButton>
            </>
          )}

          {withMermaid && (
            <>
              <div className="w-px h-4 bg-ocean-700 mx-1" />
              <ToolbarButton
                onClick={() => editor.chain().focus().insertMermaid?.().run()}
                title="Insert Flowchart" active={false}>
                ⬡ Flowchart
              </ToolbarButton>
            </>
          )}

          {readonly && onAddComment && (
            <>
              <div className="w-px h-4 bg-ocean-700 mx-1" />
              <ToolbarButton onClick={handleAddComment} title="Tambah Komentar" active={false}>
                💬 Komentar
              </ToolbarButton>
            </>
          )}
        </div>
      )}

      {readonly && onAddComment && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-ocean-900/60 border-b border-ocean-800">
          <span className="text-[10px] text-ocean-500">Blok teks lalu klik</span>
          <button type="button" onClick={handleAddComment}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg
                       bg-gold-500/10 border border-gold-500/30 text-gold-400
                       hover:bg-gold-500/20 transition-colors">
            💬 Tambah Komentar
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-invert prose-sm max-w-none p-4 min-h-[160px]
                   focus:outline-none [&_.ProseMirror]:outline-none
                   [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse
                   [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-ocean-700 [&_.ProseMirror_td]:p-2
                   [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-ocean-600 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-ocean-800
                   [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
                   [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-ocean-600
                   [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  )
}
