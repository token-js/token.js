import { describe, expect, it } from 'vitest'

import { TokenJS } from '../../src'
import { InputError } from '../../src/handlers/types'
import {
  getDummyMessages,
  getDummyMessagesWithImage,
  getDummyTool,
} from '../dummy'

describe('Base Handler', () => {
  it('throws an error for a number greater than the max temperature', async () => {
    const tokenjs = new TokenJS()
    await expect(
      tokenjs.chat.completions.create({
        provider: 'openai',
        model: 'gpt-4o',
        messages: getDummyMessages(),
        temperature: 2.1,
      })
    ).rejects.toThrow()
  })

  it("throws an error when an image is detected but the model doesn't support images", async () => {
    const tokenjs = new TokenJS()
    await expect(
      tokenjs.chat.completions.create({
        provider: 'openai',
        model: 'gpt-4',
        messages: getDummyMessagesWithImage(),
        temperature: 0.5,
      })
    ).rejects.toThrow(
      new InputError(
        `Detected an image in the 'messages' array, but the following model does not support images: gpt-4`
      )
    )
  })

  it("throws an error when 'tool_choice' parameter is present but the model doesn't support tools", async () => {
    const tokenjs = new TokenJS()
    await expect(
      tokenjs.chat.completions.create({
        provider: 'ai21',
        model: 'jamba-instruct',
        messages: getDummyMessages(),
        temperature: 0.5,
        tool_choice: 'auto',
      })
    ).rejects.toThrow(
      new InputError(
        `Detected a 'tool_choice' parameter, but the following model does not support tools: jamba-instruct`
      )
    )
  })

  it("throws an error when 'tools' parameter is present but the model doesn't support tools", async () => {
    const tokenjs = new TokenJS()
    await expect(
      tokenjs.chat.completions.create({
        provider: 'ai21',
        model: 'jamba-instruct',
        messages: getDummyMessages(),
        temperature: 0.5,
        tools: [getDummyTool()],
      })
    ).rejects.toThrow(
      new InputError(
        `Detected a 'tools' parameter, but the following model does not support tools: jamba-instruct`
      )
    )
  })
})
