"use client"

import { NodeViewWrapper } from "@tiptap/react"
import { useEffect, useRef, useState } from "react"

interface MermaidNodeViewProps {
  node: { attrs: { code: string } }
  updateAttributes: (attrs: { code: string }) => void
  selected: boolean
}

export function MermaidNodeView({ node, updateAttributes, selected }: MermaidNodeViewProps) {
  const [code, setCode] = useState(node.attrs.code)
  const [editing, setEditing] = useState(false)
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({ startOnLoad: false, theme: "dark", themeVariables: { background: "#0a2f2c" } })
        const { svg: rendered } = await mermaid.render(idRef.current, code)
        if (!cancelled) { setSvg(rendered); setError("") }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error rendering diagram")
      }
    }
    render()
    return () => { cancelled = true }
  }, [code])

  function save() {
    updateAttributes({ code })
    setEditing(false)
  }

  return (
    <NodeViewWrapper className="my-4 rounded-xl border border-ocean-700 overflow-hidden bg-ocean-900/50">
      {editing ? (
        <div className="p-3 space-y-2">
          <p className="text-[10px] font-mono text-ocean-500 uppercase tracking-widest">Kode Mermaid</p>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
            className="w-full bg-ocean-950 border border-ocean-700 rounded-lg p-3 text-sm
                       font-mono text-ocean-200 focus:outline-none focus:border-ocean-500 resize-y"
          />
          <div className="flex gap-2">
            <button onClick={save}
              className="px-3 py-1.5 text-xs rounded-lg bg-ocean-700 hover:bg-ocean-600 text-white transition-colors">
              Simpan
            </button>
            <button onClick={() => { setCode(node.attrs.code); setEditing(false) }}
              className="px-3 py-1.5 text-xs rounded-lg bg-ocean-900 hover:bg-ocean-800 text-ocean-400 transition-colors">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {error ? (
            <div className="p-4 text-red-400 text-xs font-mono">{error}</div>
          ) : svg ? (
            <div className="p-4 flex justify-center overflow-auto"
                 dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <div className="p-4 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-ocean-600 border-t-ocean-300 animate-spin" />
            </div>
          )}
          {selected && (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-2 right-2 px-2 py-1 text-[10px] rounded bg-ocean-800
                         border border-ocean-700 text-ocean-400 hover:text-white transition-colors"
            >
              Edit Diagram
            </button>
          )}
        </div>
      )}
    </NodeViewWrapper>
  )
}
