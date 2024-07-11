import { describe, expect, it } from 'vitest'

import { LLM } from '../../src'
import { getDummyMessages } from '../dummy'

describe('Base Handler', () => {
  it('throws an error for a number greater than the max temperature', async () => {
    const llm = new LLM()
    await expect(
      llm.chat.completions.create({
        provider: 'openai',
        model: 'gpt-4o',
        messages: getDummyMessages(),
        temperature: 2.1,
      })
    ).rejects.toThrow()
  })
})
