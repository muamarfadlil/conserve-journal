export interface ArticleComment {
  id: string
  selectionText: string
  comment: string
  reviewerName: string
  paragraphIndex: number
  createdAt: number
}

export interface ArticleDraft {
  id?: number
  title: string
  author: string
  affiliate: string
  correspondence: string
  email: string
  abstract: string
  introduction: string
  methodology: string
  results: string
  conclusion: string
  references: string
  plagiasiFile?: string
  attachments?: string[]
  coverLetterFile?: string
  comments: ArticleComment[]
  status: "draft" | "submitted" | "reviewed"
  createdAt: number
  updatedAt: number
}
