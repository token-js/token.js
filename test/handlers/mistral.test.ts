import MistralClient, {
  ChatCompletionResponse,
  ChatCompletionResponseChunk,
  ToolCalls,
} from '@mistralai/mistralai'
import {
  ChatCompletionMessage,
  ChatCompletionToolChoiceOption,
} from 'openai/resources/index'
import { ChatCompletionMessageParam } from 'openai/src/resources/index.js'
import { describe, expect, it, vi } from 'vitest'

import { CompletionParams } from '../../src/chat'
import {
  MistralHandler,
  convertMessages,
  convertStreamToolCalls,
  convertToolCalls,
  convertToolConfig,
  findLinkedToolCallName,
} from '../../src/handlers/mistral'
import { InputError } from '../../src/handlers/types'
import { models } from '../../src/models'
import { StreamCompletionResponse } from '../../src/userTypes'

describe('findLinkedToolCallName', () => {
  it('should return the correct function name for a given tool call ID', () => {
    const messages: (ChatCompletionMessage | ChatCompletionMessageParam)[] = [
      {
        role: 'assistant',
        content: 'Assistant message',
        tool_calls: [
          {
            id: 'tool1',
            function: { name: 'function1', arguments: '{}' },
            type: 'function',
          },
        ],
      },
    ]

    const result = findLinkedToolCallName(
      messages as ChatCompletionMessage[],
      'tool1'
    )
    expect(result).toBe('function1')
  })

  it('should error if the tool call ID is not found', () => {
    const messages: (ChatCompletionMessage | ChatCompletionMessageParam)[] = [
      {
        role: 'assistant',
        content: 'Assistant message',
        tool_calls: [
          {
            id: 'tool1',
            function: { name: 'function1', arguments: '{}' },
            type: 'function',
          },
        ],
      },
    ]

    expect(() =>
      findLinkedToolCallName(
        messages as ChatCompletionMessage[],
        'nonexistentTool'
      )
    ).toThrow(InputError)
  })
})

describe('convertMessages', () => {
  it('should convert user messages correctly', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'user',
        content: 'User message',
      },
    ]

    const result = convertMessages(messages)

    expect(result).toEqual([
      {
        role: 'user',
        content: 'User message',
      },
    ])
  })

  it('should throw an error for image inputs in messages', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: 'http://example.com/image.png' },
          },
        ],
      },
    ]

    expect(() => convertMessages(messages)).toThrow(
      'Image inputs are not supported by Mistral'
    )
  })

  it('should convert tool messages with linked tool call name', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'tool',
        content: 'Tool response',
        tool_call_id: 'tool1',
      },
      {
        role: 'assistant',
        content: 'Assistant message',
        tool_calls: [
          {
            id: 'tool1',
            function: { name: 'function1', arguments: '{}' },
            type: 'function',
          },
        ],
      },
    ]

    const result = convertMessages(messages)

    expect(result).toEqual([
      {
        role: 'tool',
        content: 'Tool response',
        name: 'function1',
        tool_call_id: 'tool1',
      },
      {
        role: 'assistant',
        content: 'Assistant message',
        tool_calls: [
          {
            id: 'tool1',
            function: { name: 'function1', arguments: '{}' },
            type: 'function',
          },
        ],
      },
    ])
  })

  it('should throw an error if the tool call ID is not found', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'tool',
        content: 'Tool response',
        tool_call_id: 'nonexistentTool',
      },
    ]

    expect(() => convertMessages(messages)).toThrow(InputError)
  })

  it('should convert system messages correctly', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'system',
        content: 'System message',
      },
    ]

    const result = convertMessages(messages)

    expect(result).toEqual([
      {
        role: 'system',
        content: 'System message',
      },
    ])
  })

  it('should convert assistant messages with tool calls correctly', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'assistant',
        content: 'Assistant message',
        tool_calls: [
          {
            id: 'tool1',
            function: { name: 'function1', arguments: '{}' },
            type: 'function',
          },
        ],
      },
    ]

    const result = convertMessages(messages)

    expect(result).toEqual([
      {
        role: 'assistant',
        content: 'Assistant message',
        tool_calls: [
          {
            id: 'tool1',
            function: { name: 'function1', arguments: '{}' },
            type: 'function',
          },
        ],
      },
    ])
  })

  it('should convert assistant messages without tool calls correctly', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'assistant',
        content: 'Assistant message',
      },
    ]

    const result = convertMessages(messages)

    expect(result).toEqual([
      {
        role: 'assistant',
        content: 'Assistant message',
        tool_calls: null,
      },
    ])
  })

  it('should throw an error for function messages', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'function',
        content: 'Function message',
        name: 'function1',
      },
    ]

    expect(() => convertMessages(messages)).toThrow(
      'Function messages are deprecated.'
    )
  })

  it('should handle nested content types for user messages correctly', () => {
    const messages: (ChatCompletionMessageParam | ChatCompletionMessage)[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Text part 1' },
          { type: 'text', text: 'Text part 2' },
        ],
      },
    ]

    const result = convertMessages(messages)

    expect(result).toEqual([
      {
        role: 'user',
        content: ['Text part 1', 'Text part 2'],
      },
    ])
  })
})

describe('convertToolConfig', () => {
  it('should handle a specific function object in toolChoice', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
          description: 'Description 1',
          parameters: { param1: 'value1' },
        },
      },
      {
        type: 'function',
        function: {
          name: 'function2',
          description: 'Description 2',
          parameters: { param2: 'value2' },
        },
      },
    ]

    const toolChoice: ChatCompletionToolChoiceOption = {
      type: 'function',
      function: {
        name: 'function2',
      },
    }

    const result = convertToolConfig(toolChoice, tools)

    expect(result).toEqual({
      toolChoice: 'any',
      tools: [
        {
          type: 'function',
          function: {
            name: 'function2',
            description: 'Description 2',
            parameters: { param2: 'value2' },
          },
        },
      ],
    })
  })

  it('should handle toolChoice "auto"', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
          description: 'Description 1',
          parameters: { param1: 'value1' },
        },
      },
    ]

    const result = convertToolConfig('auto', tools)

    expect(result).toEqual({
      toolChoice: 'auto',
      tools: [
        {
          type: 'function',
          function: {
            name: 'function1',
            description: 'Description 1',
            parameters: { param1: 'value1' },
          },
        },
      ],
    })
  })

  it('should handle toolChoice "none"', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
          description: 'Description 1',
          parameters: { param1: 'value1' },
        },
      },
    ]

    const result = convertToolConfig('none', tools)

    expect(result).toEqual({
      toolChoice: 'none',
      tools: [
        {
          type: 'function',
          function: {
            name: 'function1',
            description: 'Description 1',
            parameters: { param1: 'value1' },
          },
        },
      ],
    })
  })

  it('should handle toolChoice "required"', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
          description: 'Description 1',
          parameters: { param1: 'value1' },
        },
      },
    ]

    const result = convertToolConfig('required', tools)

    expect(result).toEqual({
      toolChoice: 'any',
      tools: [
        {
          type: 'function',
          function: {
            name: 'function1',
            description: 'Description 1',
            parameters: { param1: 'value1' },
          },
        },
      ],
    })
  })

  it('should throw an error for an invalid toolChoice', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
          description: 'Description 1',
          parameters: { param1: 'value1' },
        },
      },
    ]

    expect(() => convertToolConfig('invalid' as any, tools)).toThrow(InputError)
  })

  it('should handle tools with missing description and parameters', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
        },
      },
    ]

    const result = convertToolConfig('auto', tools)

    expect(result).toEqual({
      toolChoice: 'auto',
      tools: [
        {
          type: 'function',
          function: {
            name: 'function1',
            description: '',
            parameters: {},
          },
        },
      ],
    })
  })

  it('should return undefined if tools are not provided', () => {
    const result = convertToolConfig('auto', undefined)
    expect(result.tools).toBeUndefined()
  })

  it('should throw an error if no tools match the specificFunctionName', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
          description: 'Description 1',
          parameters: { param1: 'value1' },
        },
      },
      {
        type: 'function',
        function: {
          name: 'function2',
          description: 'Description 2',
          parameters: { param2: 'value2' },
        },
      },
    ]

    const toolChoice: ChatCompletionToolChoiceOption = {
      type: 'function',
      function: {
        name: 'nonexistentFunction',
      },
    }

    expect(() => convertToolConfig(toolChoice, tools)).toThrow(InputError)
  })

  it('should handle undefined toolChoice', () => {
    const tools: CompletionParams['tools'] = [
      {
        type: 'function',
        function: {
          name: 'function1',
          description: 'Description 1',
          parameters: { param1: 'value1' },
        },
      },
      {
        type: 'function',
        function: {
          name: 'function2',
          description: 'Description 2',
          parameters: { param2: 'value2' },
        },
      },
    ]

    const result = convertToolConfig(undefined, tools)

    expect(result).toEqual({
      toolChoice: undefined,
      tools: [
        {
          type: 'function',
          function: {
            name: 'function1',
            description: 'Description 1',
            parameters: { param1: 'value1' },
          },
        },
        {
          type: 'function',
          function: {
            name: 'function2',
            description: 'Description 2',
            parameters: { param2: 'value2' },
          },
        },
      ],
    })
  })
})

describe('convertToolCalls and convertStreamToolCalls', () => {
  it('should return undefined if toolResponse is not provided in convertToolCalls', () => {
    const result = convertToolCalls(undefined)
    expect(result).toBeUndefined()
  })

  it('should convert toolResponse to ChatCompletionMessageToolCall array in convertToolCalls', () => {
    const toolResponse: ToolCalls[] = [
      {
        id: 'tool1',
        function: {
          name: 'function1',
          arguments: '{"key": "value"}',
        },
      },
    ]

    const result = convertToolCalls(toolResponse)

    expect(result).toEqual([
      {
        id: 'tool1',
        type: 'function',
        function: {
          name: 'function1',
          arguments: '{"key": "value"}',
        },
      },
    ])
  })

  it('should return undefined if toolResponse is not provided in convertStreamToolCalls', () => {
    const result = convertStreamToolCalls(undefined)
    expect(result).toBeUndefined()
  })

  it('should convert toolResponse to ChatCompletionChunk.Choice.Delta.ToolCall array in convertStreamToolCalls', () => {
    const toolResponse: ToolCalls[] = [
      {
        id: 'tool1',
        function: {
          name: 'function1',
          arguments: '{"key": "value"}',
        },
      },
    ]

    const result = convertStreamToolCalls(toolResponse)

    expect(result).toEqual([
      {
        id: 'tool1',
        type: 'function',
        function: {
          name: 'function1',
          arguments: '{"key": "value"}',
        },
        index: 0,
      },
    ])
  })

  it('should handle multiple tool calls correctly in convertStreamToolCalls', () => {
    const toolResponse: ToolCalls[] = [
      {
        id: 'tool1',
        function: {
          name: 'function1',
          arguments: '{"key1": "value1"}',
        },
      },
      {
        id: 'tool2',
        function: {
          name: 'function2',
          arguments: '{"key2": "value2"}',
        },
      },
    ]

    const result = convertStreamToolCalls(toolResponse)

    expect(result).toEqual([
      {
        id: 'tool1',
        type: 'function',
        function: {
          name: 'function1',
          arguments: '{"key1": "value1"}',
        },
        index: 0,
      },
      {
        id: 'tool2',
        type: 'function',
        function: {
          name: 'function2',
          arguments: '{"key2": "value2"}',
        },
        index: 1,
      },
    ])
  })
})

describe('MistralHandler', () => {
  const mockBasicChatResponse: ChatCompletionResponse = {
    id: '46d695c96b4545f4b842d4801632da3b',
    object: 'chat.completion',
    created: 1720551878,
    model: 'open-mistral-7b',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content:
            "Of course, I'd be happy to share a joke with you! Here's a light-hearted one:\n\nWhy don't scientists trust atoms?\n\nBecause they make up everything!",
          tool_calls: null,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 8,
      total_tokens: 51,
      completion_tokens: 43,
    },
  }

  const mockToolChatResponse: ChatCompletionResponse = {
    id: 'f403d3241f494981958486f3c8f16c6d',
    object: 'chat.completion',
    created: 1720554062,
    model: 'mistral-large-2402',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              id: 'gGIJ6pnKA',
              function: {
                name: 'getCurrentWeather',
                arguments: '{"location": "Portland, OR", "unit": "fahrenheit"}',
              },
            },
          ],
        },
        finish_reason: 'tool_calls',
      },
    ],
    usage: {
      prompt_tokens: 119,
      total_tokens: 151,
      completion_tokens: 32,
    },
  }

  const mockChatStreamResponse: AsyncGenerator<
    ChatCompletionResponseChunk,
    void,
    unknown
  > = (async function* () {
    yield {
      id: 'f403d3241f494981958486f3c8f16c6d',
      object: 'chat.completion.chunk',
      created: 1720554062,
      model: 'mistral-large-2402',
      choices: [
        {
          index: 0,
          delta: {
            role: 'assistant',
            content: '',
            tool_calls: [
              {
                id: 'gGIJ6pnKA',
                function: {
                  name: 'getCurrentWeather',
                  arguments:
                    '{"location": "Portland, OR", "unit": "fahrenheit"}',
                },
              },
            ],
          },
          finish_reason: 'tool_calls',
        },
      ],
      usage: {
        prompt_tokens: 119,
        total_tokens: 151,
        completion_tokens: 32,
      },
    } as ChatCompletionResponseChunk
  })()

  vi.mock('@mistralai/mistralai', () => ({
    default: vi.fn().mockImplementation(() => ({
      chat: vi.fn().mockResolvedValue(mockBasicChatResponse),
      chatStream: vi.fn().mockReturnValue(mockChatStreamResponse),
    })),
  }))

  const toolPrompt: CompletionParams = {
    provider: 'mistral',
    model: 'mistral-large-2402',
    messages: [
      {
        role: 'user',
        content: `What's the weather like in Portland Oregon?`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'getCurrentWeather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA',
              },
              unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
            },
            required: ['location', 'unit'],
          },
        },
      },
    ],
    tool_choice: 'auto',
  }

  const handlerOptions = { apiKey: 'test-api-key' }
  const handler = new MistralHandler(
    handlerOptions,
    models.mistral.models,
    models.mistral.supportsJSON
  )

  it('should return a completion response', async () => {
    ;(MistralClient as any).mockImplementationOnce(() => ({
      chat: vi.fn().mockResolvedValue(mockBasicChatResponse),
      chatStream: vi.fn(),
    }))

    const params: CompletionParams = {
      provider: 'mistral',
      model: 'open-mistral-7b',
      messages: [
        {
          role: 'user',
          content: 'Tell me a joke.',
        },
      ],
      tools: [],
      temperature: 1,
      stream: false,
    }

    const response = await handler.create(params)

    expect(response).toEqual({
      id: mockBasicChatResponse.id,
      created: mockBasicChatResponse.created,
      object: mockBasicChatResponse.object,
      model: mockBasicChatResponse.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: mockBasicChatResponse.choices[0].message.content,
            tool_calls: undefined,
          },
          finish_reason: 'stop',
          logprobs: null,
        },
      ],
      usage: {
        prompt_tokens: mockBasicChatResponse.usage.prompt_tokens,
        completion_tokens: mockBasicChatResponse.usage.completion_tokens,
        total_tokens: mockBasicChatResponse.usage.total_tokens,
      },
    })
  })

  it('should return a tool completion response', async () => {
    ;(MistralClient as any).mockImplementationOnce(() => ({
      chat: vi.fn().mockResolvedValue(mockToolChatResponse),
      chatStream: vi.fn(),
    }))

    const response = await handler.create(toolPrompt)

    expect(response).toEqual({
      id: mockToolChatResponse.id,
      created: mockToolChatResponse.created,
      object: mockToolChatResponse.object,
      model: mockToolChatResponse.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: mockToolChatResponse.choices[0].message.content,
            tool_calls: [
              {
                function: {
                  arguments:
                    '{"location": "Portland, OR", "unit": "fahrenheit"}',
                  name: 'getCurrentWeather',
                },
                id: 'gGIJ6pnKA',
                type: 'function',
              },
            ],
          },
          finish_reason: 'tool_calls',
          logprobs: null,
        },
      ],
      usage: {
        prompt_tokens: mockToolChatResponse.usage.prompt_tokens,
        completion_tokens: mockToolChatResponse.usage.completion_tokens,
        total_tokens: mockToolChatResponse.usage.total_tokens,
      },
    })
  })

  it('should return a stream completion response', async () => {
    ;(MistralClient as any).mockImplementationOnce(() => ({
      chat: vi.fn(),
      chatStream: vi.fn().mockReturnValue(mockChatStreamResponse),
    }))

    const params: CompletionParams = {
      ...toolPrompt,
      stream: true,
    }

    const responseStream = await handler.create(params)

    const chunks: StreamCompletionResponse[] = []
    for await (const chunk of responseStream as AsyncGenerator<
      StreamCompletionResponse,
      void,
      unknown
    >) {
      chunks.push(chunk)
    }

    expect(chunks).toEqual([
      {
        id: 'f403d3241f494981958486f3c8f16c6d',
        created: 1720554062,
        object: 'chat.completion.chunk',
        model: 'mistral-large-2402',
        choices: [
          {
            index: 0,
            delta: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  function: {
                    arguments:
                      '{"location": "Portland, OR", "unit": "fahrenheit"}',
                    name: 'getCurrentWeather',
                  },
                  id: 'gGIJ6pnKA',
                  index: 0,
                  type: 'function',
                },
              ],
            },
            finish_reason: 'tool_calls',
            logprobs: null,
          },
        ],
        usage: {
          prompt_tokens: 119,
          completion_tokens: 32,
          total_tokens: 151,
        },
      },
    ])
  })
})
