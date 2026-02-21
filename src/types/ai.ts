/** AI Intelligence Layer — Type Definitions */

export interface AIAnalysis {
  tldr: string
  keyTakeaways: string[]
  sentiment: {
    label: 'positive' | 'neutral' | 'negative' | 'mixed'
    score: number
    explanation: string
  }
  readingLevel: {
    grade: number
    label: string
  }
  factCheck: {
    status: 'verified' | 'unverified' | 'mixed'
    note: string
  }
  entities: {
    people: string[]
    organizations: string[]
    locations: string[]
  }
  topics: string[]
  readTimeSaved: string
}

export interface AITranslation {
  title: string
  content: string
  lang: 'en' | 'ms'
}

export interface AIChatResponse {
  answer: string
  sourceReference: string
}

export interface AIDigest {
  headline: string
  intro: string
  stories: Array<{
    title: string
    summary: string
    category: string
    urgency: 'high' | 'medium' | 'low'
    slug?: string
  }>
  closingNote: string
}

export interface AIEditorSuggestion {
  headlines: Array<{
    text: string
    score: number
    reasoning: string
  }>
  seoSuggestions: string[]
  autoTags: string[]
  excerptSuggestion: string
}
