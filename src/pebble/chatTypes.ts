export const QUESTION_LIMIT = 400
export const ANSWER_LIMIT = 800
export const HISTORY_LIMIT = 6

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSource {
  id: string
  title: string
  url: string
}

export interface ChatReply {
  answer: string
  sources: ChatSource[]
}
