import type { IncomingMessage, ServerResponse } from 'node:http'
import { ANSWER_LIMIT, HISTORY_LIMIT, QUESTION_LIMIT } from '../../src/pebble/chatTypes.ts'
import type { ChatMessage, ChatReply } from '../../src/pebble/chatTypes.ts'
import { instructions } from './instructions.ts'
import { science } from './knowledge.ts'

const MAX_BODY = 16_384
const PATH = '/api/pebble/chat'
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/'
const safetySettings = ['HARASSMENT', 'HATE_SPEECH', 'SEXUALLY_EXPLICIT', 'DANGEROUS_CONTENT']
  .map(category => ({ category: 'HARM_CATEGORY_' + category, threshold: 'BLOCK_LOW_AND_ABOVE' }))
const privateText = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b|(?:\+?\d[ .()-]*){8,}|\b(?:https?:\/\/|www\.)|\b(?:oc_sk_|AIza[\w-]{20,}|AQ\.[\w-]{20,})/iu
const unsafeText = /\b(?:porn(?:ography)?|nudes?|kill myself|make a bomb|build a bomb)\b|(?:انتحر|أنتحر|صنع قنبلة|صور عارية|إباحية)/iu
const blocked = (text: string) => privateText.test(text) || unsafeText.test(text)

function send(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(body))
}

function parseRequest(raw: string) {
  const data: unknown = JSON.parse(raw)
  if (!data || typeof data !== 'object') return null
  const { question, history, context } = data as Record<string, unknown>
  if (typeof question !== 'string' || !question.trim() || question.length > QUESTION_LIMIT ||
      !Array.isArray(history) || history.length > HISTORY_LIMIT ||
      !context || typeof context !== 'object' || Array.isArray(context) ||
      JSON.stringify(context).length > 6000) return null
  const messages: ChatMessage[] = []
  for (const item of history) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant') ||
        typeof item.content !== 'string' || item.content.length > ANSWER_LIMIT) return null
    messages.push({ role: item.role, content: item.content })
  }
  return { question: question.trim(), history: messages, context }
}

function parseReply(content: unknown): ChatReply {
  if (typeof content !== 'string') throw new Error('Missing answer')
  const reply = JSON.parse(content.trim().replace(/^\x60{3}(?:json)?\s*|\s*\x60{3}$/gi, ''))
  if (typeof reply?.answer !== 'string' || !reply.answer.trim() || reply.answer.length > ANSWER_LIMIT ||
      blocked(reply.answer) || !Array.isArray(reply.sourceIds)) throw new Error('Invalid answer')
  return {
    answer: reply.answer.trim(),
    sources: science.filter(source => reply.sourceIds.includes(source.id)).map(({ id, title, url }) => ({ id, title, url })),
  }
}

export function pebbleMiddleware(
  env: { GEMINI_API_KEY?: string; PEBBLE_MODEL?: string; PEBBLE_LOCAL_DEMO?: string },
  requestModel = fetch,
) {
  let active = 0
  let windowEndsAt = 0
  let requests = 0
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url?.split('?')[0] !== PATH) return next()
    if (req.headers['sec-fetch-site'] === 'cross-site' ||
        (req.headers.origin && URL.parse(req.headers.origin)?.host !== req.headers.host)) {
      return send(res, 403, { error: 'origin' })
    }
    const hasGemini = !!env.GEMINI_API_KEY && (env.PEBBLE_LOCAL_DEMO === '1' || process.env.NODE_ENV !== 'production')
    if (req.method === 'GET') return send(res, 200, { enabled: true, hasGemini })
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST')
      return send(res, 405, { error: 'method' })
    }
    if (req.headers['content-type']?.split(';')[0] !== 'application/json') return send(res, 415, { error: 'invalid' })
    const now = Date.now()
    if (now >= windowEndsAt) {
      windowEndsAt = now + 60_000
      requests = 0
    }
    if (active >= 4 || requests >= 20) return send(res, 429, { error: 'busy' })

    requests++
    active++
    try {
      let data
      try {
        // Keep the stream open long enough to send a 413 when the limit is reached.
        const chunks: Buffer[] = []
        let length = 0
        for await (const chunk of req.iterator({ destroyOnReturn: false })) {
          const bytes = Buffer.from(chunk)
          length += bytes.length
          if (length > MAX_BODY) {
            res.setHeader('Connection', 'close')
            req.resume()
            return send(res, 413, { error: 'invalid' })
          }
          chunks.push(bytes)
        }
        data = parseRequest(Buffer.concat(chunks).toString('utf8'))
      } catch {
        return send(res, 400, { error: 'invalid' })
      }
      if (!data) return send(res, 400, { error: 'invalid' })
      if (blocked(data.question) || blocked(JSON.stringify(data.context)) || data.history.some(m => blocked(m.content))) {
        return send(res, 422, { error: 'filtered' })
      }
      if (!hasGemini) {
        return send(res, 200, {
          answer: "I'm running on onboard autonomous intelligence! Follow the orange mission markers, clean the solar panels outside or throw the backup breaker for power, and take cover in the radiation shelter if a storm arrives!",
          sources: science.slice(0, 1).map(({ id, title, url }) => ({ id, title, url })),
        })
      }
      const model = encodeURIComponent(env.PEBBLE_MODEL || 'gemini-3.1-flash-lite')
      const upstream = await requestModel(ENDPOINT + model + ':generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': env.GEMINI_API_KEY!, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instructions }] },
          contents: [
            ...data.history.map(({ role, content }) => ({
              role: role === 'assistant' ? 'model' : 'user', parts: [{ text: content }],
            })),
            { role: 'user', parts: [{ text: JSON.stringify({ latestGameSnapshot: data.context, question: data.question }) }] },
          ],
          safetySettings,
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
        redirect: 'error',
        signal: AbortSignal.timeout(24_000),
      })
      if (!upstream.ok) {
        await upstream.body?.cancel()
        return send(res, upstream.status === 429 ? 429 : 503, { error: upstream.status === 429 ? 'busy' : 'unavailable' })
      }
      const result = await upstream.json() as {
        promptFeedback?: { blockReason?: string }
        candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[]
      }
      const candidate = result.candidates?.[0]
      if (result.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY') {
        return send(res, 422, { error: 'filtered' })
      }
      if (candidate?.finishReason !== 'STOP') throw new Error('Incomplete answer')
      const content = candidate.content?.parts?.filter(part => !part.thought).map(part => part.text).join('')
      return send(res, 200, parseReply(content))
    } catch {
      return send(res, 502, { error: 'unavailable' })
    } finally {
      active--
    }
  }
}
