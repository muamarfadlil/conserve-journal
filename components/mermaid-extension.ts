import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"

// The actual React component is loaded dynamically to avoid SSR issues with mermaid
// Import path is resolved at runtime
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaid: {
      insertMermaid: () => ReturnType
    }
  }
}

export const MermaidExtension = Node.create({
  name: "mermaid",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      code: {
        default: "flowchart TD\n  A[Mulai] --> B[Proses]\n  B --> C[Selesai]",
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "mermaid" })]
  },

  addCommands() {
    return {
      insertMermaid:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { code: "flowchart TD\n  A[Mulai] --> B[Proses]\n  B --> C[Selesai]" },
          })
        },
    }
  },

  addNodeView() {
    // Dynamically required to avoid circular import
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MermaidNodeView } = require("./MermaidNodeView")
    return ReactNodeViewRenderer(MermaidNodeView)
  },
})
