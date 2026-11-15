import { instructions } from '../../server/pebble/instructions.ts'
import { science } from '../../server/pebble/knowledge.ts'
import { ANSWER_LIMIT } from './chatTypes.ts'
import type { ChatMessage, ChatReply } from './chatTypes.ts'

// GitHub Pages has no API server. Its build can opt into direct browser requests.
export async function askGemini(
  key: string,
  model: string,
  question: string,
  history: ChatMessage[],
  context: unknown,
  signal: AbortSignal,
  requestModel = fetch,
): Promise<ChatReply> {
  const response = await requestModel(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents: [
          ...history.map(({ role, content }) => ({
            role: role === 'assistant' ? 'model' : 'user', parts: [{ text: content }],
          })),
          { role: 'user', parts: [{ text: JSON.stringify({ latestGameSnapshot: context, question }) }] },
        ],
        safetySettings: ['HARASSMENT', 'HATE_SPEECH', 'SEXUALLY_EXPLICIT', 'DANGEROUS_CONTENT']
          .map(category => ({ category: 'HARM_CATEGORY_' + category, threshold: 'BLOCK_LOW_AND_ABOVE' })),
        generationConfig: {
          maxOutputTokens: 1000,
          ...(model === 'gemini-3.1-flash-lite' ? { thinkingConfig: { thinkingLevel: 'MINIMAL' } } : {}),
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: { answer: { type: 'STRING' }, sourceIds: { type: 'ARRAY', items: { type: 'STRING' } } },
            required: ['answer', 'sourceIds'],
          },
        },
      }),
      signal,
    },
  )
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(`PEBBLE request failed (${response.status})`)
  }
  const result = await response.json()
  const candidate = result.candidates?.[0]
  if (result.promptFeedback?.blockReason || candidate?.finishReason !== 'STOP') {
    throw new Error('PEBBLE answer unavailable')
  }
  const content = candidate.content?.parts
    ?.filter((part: { thought?: boolean }) => !part.thought)
    .map((part: { text?: string }) => part.text ?? '').join('')
  if (!content) throw new Error('Missing PEBBLE answer')
  const reply = JSON.parse(content.trim().replace(/^\x60{3}(?:json)?\s*|\s*\x60{3}$/gi, ''))
  if (typeof reply?.answer !== 'string' || !reply.answer.trim() ||
      reply.answer.length > ANSWER_LIMIT || !Array.isArray(reply.sourceIds)) {
    throw new Error('Invalid PEBBLE answer')
  }
  return {
    answer: reply.answer.trim(),
    sources: science.filter(source => reply.sourceIds.includes(source.id))
      .map(({ id, title, url }) => ({ id, title, url })),
  }
}
