import { describe, expect, it } from 'vitest'

import { CompletionParams } from '../../src/chat'
import { convertMessages, convertToolParams } from '../../src/handlers/bedrock'
import { getDummyTool } from '../dummy'
import { MESSAGES_WITH_ASSISTANT_TOOL_CALLS_AND_TOOL_RESULTS } from './messages'

describe('convertToolParams', () => {
  it(`returns undefined when 'tool_choice' is 'none'`, () => {
    expect(convertToolParams('none', [getDummyTool()])).toEqual(undefined)
  })
})

describe('convertMessages', () => {
  it(`converts assistant message containing tool calls followed by tool results`, async () => {
    const { systemMessages, messages } = await convertMessages(
      MESSAGES_WITH_ASSISTANT_TOOL_CALLS_AND_TOOL_RESULTS,
      'anthropic.claude-3-sonnet-20240229-v1:0'
    )
    expect(systemMessages).toEqual(undefined)
    expect(messages).toEqual([
      {
        role: 'user',
        content: [
          {
            text: "What's the weather in San Francisco, Tokyo, and Paris?",
          },
        ],
      },
      {
        role: 'assistant',
        content: [
          {
            text: 'I will use the get_current_weather tool to find the weather in San Francisco, Tokyo and Paris.',
          },
          {
            toolUse: {
              toolUseId: 'tool-call-id-1',
              input: {
                location: 'San Francisco, CA',
              },
              name: 'get_current_weather',
            },
          },
          {
            toolUse: {
              toolUseId: 'tool-call-id-2',
              input: {
                location: 'Tokyo, Japan',
              },
              name: 'get_current_weather',
            },
          },
          {
            toolUse: {
              toolUseId: 'tool-call-id-3',
              input: {
                location: 'Paris, France',
              },
              name: 'get_current_weather',
            },
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            toolResult: {
              toolUseId: 'tool-call-id-1',
              content: [
                {
                  text: '{"temperature":"72","unit":"fahrenheit"}',
                },
              ],
            },
          },
          {
            toolResult: {
              toolUseId: 'tool-call-id-2',
              content: [
                {
                  text: '{"temperature":"10","unit":"celsius"}',
                },
              ],
            },
          },
          {
            toolResult: {
              toolUseId: 'tool-call-id-3',
              content: [
                {
                  text: '{"temperature":"22","unit":"fahrenheit"}',
                },
              ],
            },
          },
        ],
      },
    ])
  })
})
