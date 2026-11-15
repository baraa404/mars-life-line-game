import assert from 'node:assert/strict'
import test from 'node:test'
import { askGemini } from '../../src/pebble/gemini.ts'

const signal = new AbortController().signal
const response = (reply, extra = {}) => Response.json({ candidates: [{
  finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(reply) }] }, ...extra,
}] })

test('direct Gemini chat sends history and live readings and only returns known sources', async () => {
  const reply = await askGemini('test-key', 'gemini-3.1-flash-lite', 'What should I do?', [
    { role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Welcome' },
  ], { batteryPercent: 23 }, signal, async (url, options) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent')
    assert.equal(options.headers['x-goog-api-key'], 'test-key')
    assert.equal(options.signal, signal)
    const body = JSON.parse(options.body)
    assert.deepEqual(body.contents.map(item => item.role), ['user', 'model', 'user'])
    assert.deepEqual(JSON.parse(body.contents[2].parts[0].text), {
      latestGameSnapshot: { batteryPercent: 23 }, question: 'What should I do?',
    })
    assert.match(body.systemInstruction.parts[0].text, /PEBBLE/)
    assert.equal(body.generationConfig.responseMimeType, 'application/json')
    return response({ answer: ' Clean the panels. ', sourceIds: ['mars-trek', 'unknown'] })
  })
  assert.equal(reply.answer, 'Clean the panels.')
  assert.deepEqual(reply.sources.map(source => source.id), ['mars-trek'])
})

test('direct chat rejects provider failures, blocked and malformed answers for local fallback', async () => {
  for (const result of [
    new Response('', { status: 429 }),
    Response.json({ promptFeedback: { blockReason: 'SAFETY' } }),
    response({ answer: 'truncated', sourceIds: [] }, { finishReason: 'MAX_TOKENS' }),
    response({ answer: '', sourceIds: [] }),
    response({ answer: 'Hello', sourceIds: null }),
  ]) {
    await assert.rejects(askGemini('test-key', 'test-model', 'Hello', [], {}, signal, async () => result))
  }
})

test('direct chat excludes thought parts from the answer', async () => {
  const reply = await askGemini('test-key', 'test-model', 'Hello', [], {}, signal, async () =>
    Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [
      { thought: true, text: 'Internal reasoning' },
      { text: '{"answer":"Hello Commander!","sourceIds":[]}' },
    ] } }] }))
  assert.equal(reply.answer, 'Hello Commander!')
})
