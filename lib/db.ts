import Dexie, { type Table } from "dexie"
import type { ArticleDraft } from "@/types/article"

class JournalDB extends Dexie {
  drafts!: Table<ArticleDraft>

  constructor() {
    super("conserve-journal-db")
    this.version(1).stores({
      drafts: "++id, status, createdAt, updatedAt",
    })
  }
}

export const db = new JournalDB()
