import { describe, expect, it } from 'vitest'

import { CompletionParams } from '../../src/chat'
import { convertMessages } from '../../src/handlers/anthropic'
import { MESSAGES_WITH_ASSISTANT_TOOL_CALLS_AND_TOOL_RESULTS } from './messages'

describe('convertMessages', () => {
  it('converts user and system messages into a block with system messages prefixed', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'user', content: 'Hi' },
      { role: 'system', content: 'Bye' },
    ]
    const output = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Hi' },
          { type: 'text', text: 'System: Bye' },
        ],
      },
    ]
    expect(await convertMessages(input)).toEqual(output)
  })

  it('converts alternating user and assistant messages into blocks', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Yo' },
      { role: 'user', content: 'Bye' },
    ]
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Yo' }] },
      { role: 'user', content: [{ type: 'text', text: 'Bye' }] },
    ]
    expect(await convertMessages(input)).toEqual(output)
  })

  it('prepends an empty user message when the input messages start with an assistant message', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'assistant', content: 'Yo' },
      { role: 'user', content: 'Bye' },
    ]
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Empty' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Yo' }] },
      { role: 'user', content: [{ type: 'text', text: 'Bye' }] },
    ]
    expect(await convertMessages(input)).toEqual(output)
  })

  it('does not prepend a user message when the input messages start with a system message', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'system', content: 'Hello' },
      { role: 'user', content: 'Hi' },
    ]
    const output = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'System: Hello' },
          { type: 'text', text: 'Hi' },
        ],
      },
    ]
    expect(await convertMessages(input)).toEqual(output)
  })

  it('groups consecutive system messages into a single user message', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'system', content: 'Hello' },
      { role: 'system', content: 'World' },
      { role: 'user', content: 'Hi' },
    ]
    const output = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'System: Hello' },
          { type: 'text', text: 'System: World' },
          { type: 'text', text: 'Hi' },
        ],
      },
    ]
    expect(await convertMessages(input)).toEqual(output)
  })

  it(`converts assistant message containing tool calls followed by tool results`, async () => {
    const { systemMessage, messages } = await convertMessages(
      MESSAGES_WITH_ASSISTANT_TOOL_CALLS_AND_TOOL_RESULTS
    )
    expect(systemMessage).toEqual(undefined)
    expect(messages).toEqual([
      {
        content: [
          {
            text: "What's the weather in San Francisco, Tokyo, and Paris?",
            type: 'text',
          },
        ],
        role: 'user',
      },
      {
        content: [
          {
            text: 'I will use the get_current_weather tool to find the weather in San Francisco, Tokyo and Paris.',
            type: 'text',
          },
          {
            id: 'tool-call-id-1',
            input: {
              location: 'San Francisco, CA',
            },
            name: 'get_current_weather',
            type: 'tool_use',
          },
          {
            id: 'tool-call-id-2',
            input: {
              location: 'Tokyo, Japan',
            },
            name: 'get_current_weather',
            type: 'tool_use',
          },
          {
            id: 'tool-call-id-3',
            input: {
              location: 'Paris, France',
            },
            name: 'get_current_weather',
            type: 'tool_use',
          },
        ],
        role: 'assistant',
      },
      {
        content: [
          {
            content: '{"temperature":"72","unit":"fahrenheit"}',
            tool_use_id: 'tool-call-id-1',
            type: 'tool_result',
          },
          {
            content: '{"temperature":"10","unit":"celsius"}',
            tool_use_id: 'tool-call-id-2',
            type: 'tool_result',
          },
          {
            content: '{"temperature":"22","unit":"fahrenheit"}',
            tool_use_id: 'tool-call-id-3',
            type: 'tool_result',
          },
        ],
        role: 'user',
      },
    ])
  })
})

describe('convertToolParams', () => {
  it(`returns undefined when 'tool_choice' is 'none'`, () => {
    expect(convertToolParams('none', [getDummyTool()])).toEqual({
      toolChoice: undefined,
      tools: undefined,
    })
  })
})
