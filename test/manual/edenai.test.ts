import { describe, expect, it } from 'vitest'

import { TokenJS } from '../../src'

// Live tests. Require EDENAI_API_KEY and are run via `pnpm test:manual`
// (not part of CI). We assert only on returned content, never on
// provider-specific numeric fields such as usage.total_tokens.
describe('Eden AI', () => {
  it('returns completion content', async () => {
    const tokenjs = new TokenJS()
    const result = await tokenjs.chat.completions.create({
      provider: 'edenai',
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'Reply with exactly: EDEN_OK' }],
      max_tokens: 20,
    })
    const content = result.choices[0].message.content
    expect(typeof content === 'string').toEqual(true)
    expect((content ?? '').length).toBeGreaterThan(0)
  })

  it('streams completion content', async () => {
    const tokenjs = new TokenJS()
    const stream = await tokenjs.chat.completions.create({
      provider: 'edenai',
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say hello in one short sentence.' }],
      stream: true,
    })
    let output = ''
    for await (const chunk of stream) {
      output += chunk.choices[0]?.delta?.content ?? ''
    }
    expect(output.length).toBeGreaterThan(0)
  })
})
