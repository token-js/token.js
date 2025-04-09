import {
  EnhancedGenerateContentResponse,
  FinishReason,
  FunctionCallingMode,
  GenerateContentCandidate,
  GenerateContentResult,
  GenerateContentStreamResult,
  GoogleGenerativeAI,
  HarmCategory,
  HarmProbability,
  UsageMetadata,
} from '@google/generative-ai'
import OpenAI from 'openai'
import { ChatCompletionContentPart } from 'openai/resources/index'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CompletionParams } from '../../../src/chat'
import {
  convertAssistantMessage,
  convertContentsToParts,
  convertFinishReason,
  convertMessageToContent,
  convertMessagesToContents,
  convertResponseMessage,
  convertRole,
  convertStreamToolCalls,
  convertToolCalls,
  convertToolConfig,
  convertTools,
  convertUsageData,
} from '../../../src/handlers/gemini'
import { InputError } from '../../../src/handlers/types'
import { getHandler, getTimestamp } from '../../../src/handlers/utils'
import { StreamCompletionResponse } from '../../../src/userTypes'
import { MESSAGES_WITH_ASSISTANT_TOOL_CALLS_AND_TOOL_RESULTS } from './messages'

// Unit Tests
describe('convertContentsToParts', () => {
  const systemPrefix = 'PREFIX_'

  it('should return an empty array when contents is null', async () => {
    expect(await convertContentsToParts(null, systemPrefix)).toEqual([])
  })

  it('should return an empty array when contents is undefined', async () => {
    expect(await convertContentsToParts(undefined, systemPrefix)).toEqual([])
  })

  it('should return a single part with prefixed text when contents is a string', async () => {
    const contents = 'some text'
    const result = await convertContentsToParts(contents, systemPrefix)
    expect(result).toEqual([{ text: 'PREFIX_some text' }])
  })

  it('should return parts with prefixed text when contents is an array of text parts', async () => {
    const contents: ChatCompletionContentPart[] = [
      { type: 'text', text: 'text1' },
      { type: 'text', text: 'text2' },
    ]
    const result = await convertContentsToParts(contents, systemPrefix)
    expect(result).toEqual([{ text: 'PREFIX_text1' }, { text: 'PREFIX_text2' }])
  })

  it('should return parts with inlineData when contents is an array of base64 encoded image URL parts', async () => {
    const contents: ChatCompletionContentPart[] = [
      {
        type: 'image_url',
        image_url: { url: 'data:image/png;base64,examplebase64data1' },
      },
      {
        type: 'image_url',
        image_url: { url: 'data:image/png;base64,examplebase64data2' },
      },
    ]
    const result = await convertContentsToParts(contents, systemPrefix)
    expect(result).toEqual([
      { inlineData: { mimeType: 'image/png', data: 'examplebase64data1' } },
      { inlineData: { mimeType: 'image/png', data: 'examplebase64data2' } },
    ])
  })

  it('should handle mixed array of text and base64 encoded image URL parts', async () => {
    const contents: ChatCompletionContentPart[] = [
      { type: 'text', text: 'text1' },
      {
        type: 'image_url',
        image_url: { url: 'data:image/png;base64,examplebase64data' },
      },
    ]
    const result = await convertContentsToParts(contents, systemPrefix)
    expect(result).toEqual([
      { text: 'PREFIX_text1' },
      { inlineData: { mimeType: 'image/png', data: 'examplebase64data' } },
    ])
  })

  it('should throw an InputError when contents contains an invalid type', async () => {
    const contents = [{ type: 'invalid_type', text: 'text' }] as any
    await expect(() =>
      convertContentsToParts(contents, systemPrefix)
    ).rejects.toThrow(InputError)
  })

  it('should return an empty array when contents is an empty array', async () => {
    const contents: ChatCompletionContentPart[] = []
    const result = await convertContentsToParts(contents, systemPrefix)
    expect(result).toEqual([])
  })
})

describe('convertRole', () => {
  it('should return "model" when role is "assistant"', () => {
    const result = convertRole('assistant')
    expect(result).toBe('model')
  })

  it('should return "user" when role is "function"', () => {
    const result = convertRole('function')
    expect(result).toBe('user')
  })

  it('should return "user" when role is "tool"', () => {
    const result = convertRole('tool')
    expect(result).toBe('user')
  })

  it('should return "user" when role is "user"', () => {
    const result = convertRole('user')
    expect(result).toBe('user')
  })

  it('should return "user" when role is "system"', () => {
    const result = convertRole('system')
    expect(result).toBe('user')
  })

  it('should throw an InputError when role is unexpected', () => {
    expect(() => convertRole('unexpected' as any)).toThrow(InputError)
  })
})

describe('convertAssistantMessage', () => {
  it('should convert a message with text content and no tool calls', () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessage = {
      role: 'assistant',
      refusal: null,
      content: 'Hello, world!',
      tool_calls: undefined,
    }

    const result = convertAssistantMessage(message)

    expect(result).toEqual({
      role: 'model',
      parts: [{ text: 'Hello, world!' }],
    })
  })

  it('should convert a message with tool calls and no text content', () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessage = {
      role: 'assistant',
      refusal: null,
      content: null,
      tool_calls: [
        {
          type: 'function',
          id: 'testFunction',
          function: { name: 'testFunction', arguments: '{"key": "value"}' },
        },
      ],
    }

    const result = convertAssistantMessage(message)

    expect(result).toEqual({
      role: 'model',
      parts: [
        { functionCall: { name: 'testFunction', args: { key: 'value' } } },
      ],
    })
  })

  it('should convert a message with both text content and tool calls', () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessage = {
      role: 'assistant',
      refusal: null,
      content: 'Hello, world!',
      tool_calls: [
        {
          type: 'function',
          id: 'testFunction',
          function: { name: 'testFunction', arguments: '{"key": "value"}' },
        },
      ],
    }

    const result = convertAssistantMessage(message)

    expect(result).toEqual({
      role: 'model',
      parts: [
        { functionCall: { name: 'testFunction', args: { key: 'value' } } },
        { text: 'Hello, world!' },
      ],
    })
  })

  it('should convert a message with null content and no tool calls', () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessage = {
      role: 'assistant',
      refusal: null,
      content: null,
      tool_calls: undefined,
    }

    const result = convertAssistantMessage(message)

    expect(result).toEqual({
      role: 'model',
      parts: [],
    })
  })

  it('should handle messages with multiple tool calls', () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessage = {
      role: 'assistant',
      refusal: null,
      content: null,
      tool_calls: [
        {
          type: 'function',
          id: 'testFunction1',
          function: { name: 'testFunction1', arguments: '{"key1": "value1"}' },
        },
        {
          type: 'function',
          id: 'testFunction2',
          function: { name: 'testFunction2', arguments: '{"key2": "value2"}' },
        },
      ],
    }

    const result = convertAssistantMessage(message)

    expect(result).toEqual({
      role: 'model',
      parts: [
        { functionCall: { name: 'testFunction1', args: { key1: 'value1' } } },
        { functionCall: { name: 'testFunction2', args: { key2: 'value2' } } },
      ],
    })
  })

  it('should throw an InputError for an unexpected message role', () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessage = {
      role: 'unexpectedRole' as any,
      refusal: null,
      content: 'Hello, world!',
      tool_calls: undefined,
    }

    expect(() => convertAssistantMessage(message)).toThrow(InputError)
  })
})

describe('convertMessageToContent', () => {
  it('should convert a tool message correctly', async () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'tool',
      content: '{"response": "data"}',
      tool_call_id: 'testTool',
    }

    const result = await convertMessageToContent(message, false)

    expect(result).toEqual({
      role: 'user',
      parts: [
        {
          functionResponse: {
            name: 'testTool',
            response: { response: 'data' },
          },
        },
      ],
    })
  })

  it('should convert an assistant message correctly', async () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'assistant',
      content: 'Hello, world!',
      tool_calls: [
        {
          id: 'testFunction',
          type: 'function',
          function: { name: 'testFunction', arguments: '{"key": "value"}' },
        },
      ],
    }

    const result = await convertMessageToContent(message, false)

    expect(result).toEqual({
      role: 'model',
      parts: [
        { functionCall: { name: 'testFunction', args: { key: 'value' } } },
        { text: 'Hello, world!' },
      ],
    })
  })

  it('should convert a user message correctly', async () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'user',
      content: 'Hello, world!',
    }

    const result = await convertMessageToContent(message, false)

    expect(result).toEqual({
      role: 'user',
      parts: [{ text: 'Hello, world!' }],
    })
  })

  it('should convert a system message correctly without prefix', async () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'system',
      content: 'System message',
    }

    const result = await convertMessageToContent(message, false)

    expect(result).toEqual({
      role: 'user',
      parts: [{ text: 'System message' }],
    })
  })

  it('should convert a system message correctly with prefix', async () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'system',
      content: 'System message',
    }

    const result = await convertMessageToContent(message, true)

    expect(result).toEqual({
      role: 'user',
      parts: [{ text: 'System:\nSystem message' }],
    })
  })

  it('should handle messages with empty array content', async () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'user',
      content: [],
    }

    const result = await convertMessageToContent(message, false)

    expect(result).toEqual({
      role: 'user',
      parts: [],
    })
  })

  it('should throw an InputError for an unexpected message role', async () => {
    const message: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'unexpectedRole' as any,
      content: 'Hello, world!',
    }

    await expect(convertMessageToContent(message, false)).rejects.toThrow(
      InputError
    )
  })
})

describe('convertFinishReason', () => {
  it('should convert STOP to "stop"', () => {
    const result = convertFinishReason(FinishReason.STOP, [])
    expect(result).toBe('stop')
  })

  it('should convert MAX_TOKENS to "length"', () => {
    const result = convertFinishReason(FinishReason.MAX_TOKENS, [])
    expect(result).toBe('length')
  })

  it('should convert SAFETY to "content_filter"', () => {
    const result = convertFinishReason(FinishReason.SAFETY, [])
    expect(result).toBe('content_filter')
  })

  it('should convert OTHER to "stop"', () => {
    const result = convertFinishReason(FinishReason.OTHER, [])
    expect(result).toBe('stop')
  })

  it('should convert FINISH_REASON_UNSPECIFIED to "stop"', () => {
    const result = convertFinishReason(
      FinishReason.FINISH_REASON_UNSPECIFIED,
      []
    )
    expect(result).toBe('stop')
  })

  it('should convert RECITATION to "stop"', () => {
    const result = convertFinishReason(FinishReason.RECITATION, [])
    expect(result).toBe('stop')
  })

  it('should return "stop" for an unrecognized finish reason', () => {
    const result = convertFinishReason('UNKNOWN_REASON' as FinishReason, [])
    expect(result).toBe('stop')
  })

  it('should return "tool_calls" if any parts contain tool calls', () => {
    const result = convertFinishReason(FinishReason.STOP, [
      {
        functionCall: { name: 'testFunction', args: { key: 'value' } },
      },
    ])
    expect(result).toBe('tool_calls')
  })
})

describe('convertToolCalls', () => {
  beforeEach(() => {
    // Mock the nanoid module
    vi.mock('nanoid', () => {
      return {
        nanoid: () => 'mockId',
      }
    })
  })

  it('should convert parts with functionCall to ChatCompletionMessageToolCall array', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'function1',
              args: { key: 'value1' },
            },
          },
          {
            text: 'text',
          },
          {
            functionCall: {
              name: 'function2',
              args: { key: 'value2' },
            },
          },
        ],
      },
    }

    const result = convertToolCalls(candidate)

    expect(result).toEqual([
      {
        id: 'mockId',
        index: 0,
        function: {
          arguments: JSON.stringify({ key: 'value1' }),
          name: 'function1',
        },
        type: 'function',
      },
      {
        id: 'mockId',
        index: 1,
        function: {
          arguments: JSON.stringify({ key: 'value2' }),
          name: 'function2',
        },
        type: 'function',
      },
    ])
  })

  it('should return undefined when there are no parts with functionCall', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [
          {
            text: 'text1',
          },
          {
            text: 'text2',
          },
        ],
      },
    }

    const result = convertToolCalls(candidate)

    expect(result).toEqual(undefined)
  })

  it('should handle an empty parts array', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [],
      },
    }

    const result = convertToolCalls(candidate)

    expect(result).toEqual(undefined)
  })

  it('should correctly handle parts with functionCall having complex args', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [
          {
            functionCall: {
              name: 'complexFunction',
              args: { nested: { key: 'value' }, array: [1, 2, 3] },
            },
          },
        ],
      },
    }

    const result = convertToolCalls(candidate)

    expect(result).toEqual([
      {
        id: 'mockId',
        index: 0,
        function: {
          arguments: JSON.stringify({
            nested: { key: 'value' },
            array: [1, 2, 3],
          }),
          name: 'complexFunction',
        },
        type: 'function',
      },
    ])
  })
})

describe('convertToolConfig', () => {
  it('should return a config with ANY mode and specific function name for an object toolChoice', () => {
    const toolChoice: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption = {
      function: {
        name: 'testFunction',
      },
      type: 'function',
    }
    const tools = []
    const result = convertToolConfig(toolChoice, tools)

    expect(result).toEqual({
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
        allowedFunctionNames: ['testFunction'],
      },
    })
  })

  it('should return a config with AUTO mode for toolChoice "auto"', () => {
    const toolChoice = 'auto'
    const tools = []
    const result = convertToolConfig(toolChoice, tools)

    expect(result).toEqual({
      functionCallingConfig: {
        mode: FunctionCallingMode.AUTO,
      },
    })
  })

  it('should return a config with NONE mode for toolChoice "none"', () => {
    const toolChoice = 'none'
    const tools = []
    const result = convertToolConfig(toolChoice, tools)

    expect(result).toEqual({
      functionCallingConfig: {
        mode: FunctionCallingMode.NONE,
      },
    })
  })

  it('should return a config with ANY mode for toolChoice "required"', () => {
    const toolChoice = 'required'
    const tools = []
    const result = convertToolConfig(toolChoice, tools)

    expect(result).toEqual({
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
      },
    })
  })

  it('should return a config with AUTO mode if tools are provided and toolChoice is undefined', () => {
    const toolChoice = undefined
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        function: { name: 'testFunction' },
        type: 'function',
      },
    ]
    const result = convertToolConfig(toolChoice, tools)

    expect(result).toEqual({
      functionCallingConfig: {
        mode: FunctionCallingMode.AUTO,
      },
    })
  })

  it('should return a config with NONE mode if no tools are provided and toolChoice is undefined', () => {
    const toolChoice = undefined
    const tools = []
    const result = convertToolConfig(toolChoice, tools)

    expect(result).toEqual({
      functionCallingConfig: {
        mode: FunctionCallingMode.NONE,
      },
    })
  })
})

describe('convertMessagesToContents', () => {
  it('should convert messages and include a system instruction if the first message is a system message', async () => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'System message' },
      { role: 'user', content: 'User message' },
    ]

    const result = await convertMessagesToContents(messages)

    expect(result).toEqual({
      contents: [{ role: 'user', parts: [{ text: 'User message' }] }],
      systemInstruction: {
        role: 'user',
        parts: [{ text: 'System message' }],
      },
    })
  })

  it('should convert messages without a system instruction if the first message is not a system message', async () => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'user', content: 'User message 1' },
      { role: 'user', content: 'User message 2' },
    ]

    const result = await convertMessagesToContents(messages)

    expect(result).toEqual({
      contents: [
        { role: 'user', parts: [{ text: 'User message 1' }] },
        { role: 'user', parts: [{ text: 'User message 2' }] },
      ],
      systemInstruction: undefined,
    })
  })

  it('should return an empty contents array and undefined systemInstruction if messages are empty', async () => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    const result = await convertMessagesToContents(messages)

    expect(result).toEqual({
      contents: [],
      systemInstruction: undefined,
    })
  })

  it('should handle a single system message correctly', async () => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'System message' },
    ]

    const result = await convertMessagesToContents(messages)

    expect(result).toEqual({
      contents: [],
      systemInstruction: {
        role: 'user',
        parts: [{ text: 'System message' }],
      },
    })
  })

  it('should handle multiple system messages correctly by only considering the first as systemInstruction', async () => {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'System message 1' },
      { role: 'system', content: 'System message 2' },
      { role: 'user', content: 'User message' },
      { role: 'system', content: 'System message 3' },
    ]

    const result = await convertMessagesToContents(messages)

    expect(result).toEqual({
      contents: [
        { role: 'user', parts: [{ text: 'System:\nSystem message 2' }] },
        { role: 'user', parts: [{ text: 'User message' }] },
        { role: 'user', parts: [{ text: 'System:\nSystem message 3' }] },
      ],
      systemInstruction: {
        role: 'user',
        parts: [{ text: 'System message 1' }],
      },
    })
  })

  it('should convert assistant message containing tool calls followed by randomly ordered tool results', async () => {
    const result = await convertMessagesToContents(
      MESSAGES_WITH_ASSISTANT_TOOL_CALLS_AND_TOOL_RESULTS
    )
    expect(result).toEqual({
      contents: [
        {
          role: 'user',
          parts: [
            { text: "What's the weather in San Francisco, Tokyo, and Paris?" },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              functionCall: {
                name: 'get_current_weather',
                args: { location: 'San Francisco, CA' },
              },
            },
            {
              functionCall: {
                name: 'get_current_weather',
                args: { location: 'Tokyo, Japan' },
              },
            },
            {
              functionCall: {
                name: 'get_current_weather',
                args: { location: 'Paris, France' },
              },
            },
            {
              text: 'I will use the get_current_weather tool to find the weather in San Francisco, Tokyo and Paris.',
            },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: 'tool-call-id-1',
                response: { temperature: '72', unit: 'fahrenheit' },
              },
            },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: 'tool-call-id-2',
                response: { temperature: '10', unit: 'celsius' },
              },
            },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: 'tool-call-id-3',
                response: { temperature: '22', unit: 'fahrenheit' },
              },
            },
          ],
        },
      ],
    })
  })
})

describe('convertTools', () => {
  it('should return undefined if tools are undefined', () => {
    const result = convertTools(undefined)
    expect(result).toBeUndefined()
  })

  it('should convert tools correctly', () => {
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'testFunction1',
          description: 'This is a test function 1',
          parameters: {
            type: 'object',
            properties: { param1: { type: 'string' } },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'testFunction2',
          description: 'This is a test function 2',
          parameters: {
            type: 'object',
            properties: { param2: { type: 'number' } },
          },
        },
      },
    ]

    const result = convertTools(tools)

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'testFunction1',
            description: 'This is a test function 1',
            parameters: {
              type: 'object',
              properties: { param1: { type: 'string' } },
            },
          },
        ],
      },
      {
        functionDeclarations: [
          {
            name: 'testFunction2',
            description: 'This is a test function 2',
            parameters: {
              type: 'object',
              properties: { param2: { type: 'number' } },
            },
          },
        ],
      },
    ])
  })

  it('should handle an empty tools array', () => {
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = []

    const result = convertTools(tools)

    expect(result).toEqual([])
  })

  it('should handle tools with no parameters', () => {
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'testFunction1',
          description: 'This is a test function 1',
          parameters: {},
        },
      },
    ]

    const result = convertTools(tools)

    expect(result).toEqual([
      {
        functionDeclarations: [
          {
            name: 'testFunction1',
            description: 'This is a test function 1',
            parameters: {},
          },
        ],
      },
    ])
  })
})

describe('convertStreamToolCalls', () => {
  it('should map tool calls with correct indexes', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [
          { functionCall: { name: 'function1', args: { key1: 'value1' } } },
          { functionCall: { name: 'function2', args: { key2: 'value2' } } },
        ],
      },
    }

    const result = convertStreamToolCalls(candidate)

    expect(result).toEqual([
      {
        id: 'mockId',
        function: {
          arguments: JSON.stringify({ key1: 'value1' }),
          name: 'function1',
        },
        type: 'function',
        index: 0,
      },
      {
        id: 'mockId',
        function: {
          arguments: JSON.stringify({ key2: 'value2' }),
          name: 'function2',
        },
        type: 'function',
        index: 1,
      },
    ])
  })

  it('should return undefined if there are no tool calls', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [],
      },
    }

    const result = convertStreamToolCalls(candidate)

    expect(result).toBeUndefined()
  })

  it('should handle mixed parts with and without function calls', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [
          { text: 'text1' },
          { functionCall: { name: 'function1', args: { key1: 'value1' } } },
          { text: 'text2' },
          { functionCall: { name: 'function2', args: { key2: 'value2' } } },
        ],
      },
    }

    const result = convertStreamToolCalls(candidate)

    expect(result).toEqual([
      {
        id: 'mockId',
        function: {
          arguments: JSON.stringify({ key1: 'value1' }),
          name: 'function1',
        },
        type: 'function',
        index: 0,
      },
      {
        id: 'mockId',
        function: {
          arguments: JSON.stringify({ key2: 'value2' }),
          name: 'function2',
        },
        type: 'function',
        index: 1,
      },
    ])
  })
})

describe('convertResponseMessage', () => {
  beforeEach(() => {
    // Mock the nanoid module
    vi.mock('nanoid', () => {
      return {
        nanoid: () => 'mockId',
      }
    })
  })

  it('should convert response message with content and tool calls', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [
          { text: 'Hello' },
          { text: ' world' },
          { functionCall: { name: 'function1', args: { key1: 'value1' } } },
        ],
      },
    }

    const result = convertResponseMessage(candidate)

    expect(result).toEqual({
      content: 'Hello world',
      role: 'assistant',
      refusal: null,
      tool_calls: [
        {
          id: 'mockId',
          function: {
            arguments: JSON.stringify({ key1: 'value1' }),
            name: 'function1',
          },
          type: 'function',
          index: 0,
        },
      ],
    })
  })

  it('should convert response message with content and no tool calls', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [{ text: 'Hello' }, { text: ' world' }],
      },
    }

    const result = convertResponseMessage(candidate)

    expect(result).toEqual({
      content: 'Hello world',
      role: 'assistant',
      refusal: null,
      tool_calls: undefined,
    })
  })

  it('should handle empty content parts', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [],
      },
    }

    const result = convertResponseMessage(candidate)

    expect(result).toEqual({
      content: '',
      role: 'assistant',
      refusal: null,
      tool_calls: undefined,
    })
  })

  it('should handle content parts with only tool calls', () => {
    const candidate: GenerateContentCandidate = {
      index: 0,
      content: {
        role: 'model',
        parts: [
          { functionCall: { name: 'function1', args: { key1: 'value1' } } },
          { functionCall: { name: 'function2', args: { key2: 'value2' } } },
        ],
      },
    }

    const result = convertResponseMessage(candidate)

    expect(result).toEqual({
      content: '',
      role: 'assistant',
      refusal: null,
      tool_calls: [
        {
          id: 'mockId',
          function: {
            arguments: JSON.stringify({ key1: 'value1' }),
            name: 'function1',
          },
          type: 'function',
          index: 0,
        },
        {
          id: 'mockId',
          function: {
            arguments: JSON.stringify({ key2: 'value2' }),
            name: 'function2',
          },
          type: 'function',
          index: 1,
        },
      ],
    })
  })
})

describe('convertUsageData', () => {
  it('should convert usage data correctly', () => {
    const usageMetadata: UsageMetadata = {
      candidatesTokenCount: 100,
      promptTokenCount: 50,
      totalTokenCount: 150,
    }

    const result = convertUsageData(usageMetadata)

    expect(result).toEqual({
      completion_tokens: 100,
      prompt_tokens: 50,
      total_tokens: 150,
    })
  })

  it('should handle zero tokens correctly', () => {
    const usageMetadata: UsageMetadata = {
      candidatesTokenCount: 0,
      promptTokenCount: 0,
      totalTokenCount: 0,
    }

    const result = convertUsageData(usageMetadata)

    expect(result).toEqual({
      completion_tokens: 0,
      prompt_tokens: 0,
      total_tokens: 0,
    })
  })

  it('should handle large token counts correctly', () => {
    const usageMetadata: UsageMetadata = {
      candidatesTokenCount: 1000000,
      promptTokenCount: 500000,
      totalTokenCount: 1500000,
    }

    const result = convertUsageData(usageMetadata)

    expect(result).toEqual({
      completion_tokens: 1000000,
      prompt_tokens: 500000,
      total_tokens: 1500000,
    })
  })

  it('should handle missing fields by defaulting to undefined', () => {
    const usageMetadata: Partial<UsageMetadata> = {
      candidatesTokenCount: 100,
    }

    const result = convertUsageData(usageMetadata as UsageMetadata)

    expect(result).toEqual({
      completion_tokens: 100,
      prompt_tokens: undefined,
      total_tokens: undefined,
    })
  })
})

const mockBasicChatResponse: GenerateContentResult = {
  response: {
    text: () => '',
    functionCall: () => undefined,
    functionCalls: () => undefined,
    candidates: [
      {
        content: {
          parts: [
            {
              text: "Why didn't the sun go to college? \n\nBecause he already has a million degrees! 🌞 😂 \n",
            },
          ],
          role: 'model',
        },
        finishReason: FinishReason.STOP,
        index: 0,
        safetyRatings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            probability: HarmProbability.NEGLIGIBLE,
          },
        ],
      },
    ],
    usageMetadata: {
      promptTokenCount: 9,
      candidatesTokenCount: 23,
      totalTokenCount: 32,
    },
  },
}

const mockToolChatResponse: GenerateContentResult = {
  response: {
    text: () => '',
    functionCall: () => undefined,
    functionCalls: () => undefined,
    candidates: [
      {
        content: {
          parts: [
            {
              functionCall: {
                name: 'getCurrentWeather',
                args: {
                  location: 'Portland, OR',
                  unit: 'fahrenheit',
                },
              },
            },
          ],
          role: 'model',
        },
        finishReason: FinishReason.STOP,
        index: 0,
        safetyRatings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            probability: HarmProbability.NEGLIGIBLE,
          },
        ],
      },
    ],
    usageMetadata: {
      promptTokenCount: 80,
      candidatesTokenCount: 22,
      totalTokenCount: 102,
    },
  },
}

const streamFunction: AsyncGenerator<
  EnhancedGenerateContentResponse,
  void,
  unknown
> = (async function* () {
  yield {
    text: () => '',
    functionCall: () => undefined,
    functionCalls: () => undefined,
    candidates: [
      {
        content: {
          parts: [
            {
              functionCall: {
                name: 'getCurrentWeather',
                args: {
                  location: 'Portland, OR',
                  unit: 'fahrenheit',
                },
              },
            },
          ],
          role: 'model',
        },
        finishReason: FinishReason.STOP,
        index: 0,
        safetyRatings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            probability: HarmProbability.NEGLIGIBLE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            probability: HarmProbability.NEGLIGIBLE,
          },
        ],
      },
    ],
    usageMetadata: {
      promptTokenCount: 80,
      candidatesTokenCount: 22,
      totalTokenCount: 102,
    },
  }
})()

const mockChatStreamResponse: GenerateContentStreamResult = {
  stream: streamFunction,
  response: {} as any,
}

const model = 'gemini-1.5-pro'

const toolPrompt: CompletionParams = {
  provider: 'gemini',
  model,
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

describe('GeminiHandler', () => {
  vi.mock('@google/generative-ai', async (importOriginal) => {
    const originalModule = await importOriginal<
      typeof import('@google/generative-ai')
    >()
    return {
      ...originalModule,
      GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockResolvedValue(mockBasicChatResponse),
          generateContentStream: vi.fn(),
        }),
      })),
    }
  })

  const fakeDate = new Date(2000, 1, 1, 13)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a completion response', async () => {
    const handlerOptions = { apiKey: 'test-api-key' }
    const handler = getHandler('gemini', handlerOptions)

    ;(GoogleGenerativeAI as any).mockImplementationOnce(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue(mockBasicChatResponse),
        generateContentStream: vi.fn(),
      }),
    }))

    const params: CompletionParams = {
      provider: 'gemini',
      model,
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
      id: null,
      created: getTimestamp(),
      object: 'chat.completion',
      model: params.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            refusal: null,
            content:
              mockBasicChatResponse.response.candidates![0].content.parts[0]
                .text,
            tool_calls: undefined,
          },
          finish_reason: 'stop',
          logprobs: null,
        },
      ],
      usage: {
        prompt_tokens:
          mockBasicChatResponse.response.usageMetadata?.promptTokenCount,
        completion_tokens:
          mockBasicChatResponse.response.usageMetadata?.candidatesTokenCount,
        total_tokens:
          mockBasicChatResponse.response.usageMetadata?.totalTokenCount,
      },
    })
  })

  it('should return a tool completion response', async () => {
    const handlerOptions = { apiKey: 'test-api-key' }
    const handler = getHandler('gemini', handlerOptions)

    ;(GoogleGenerativeAI as any).mockImplementationOnce(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn().mockResolvedValue(mockToolChatResponse),
        generateContentStream: vi.fn(),
      }),
    }))

    const response = await handler.create(toolPrompt)

    expect(response).toEqual({
      id: null,
      created: getTimestamp(),
      object: 'chat.completion',
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            refusal: null,
            content: '',
            tool_calls: [
              {
                function: {
                  arguments: '{"location":"Portland, OR","unit":"fahrenheit"}',
                  name: 'getCurrentWeather',
                },
                id: 'mockId',
                type: 'function',
                index: 0,
              },
            ],
          },
          finish_reason: 'tool_calls',
          logprobs: null,
        },
      ],
      usage: {
        prompt_tokens:
          mockToolChatResponse.response.usageMetadata?.promptTokenCount,
        completion_tokens:
          mockToolChatResponse.response.usageMetadata?.candidatesTokenCount,
        total_tokens:
          mockToolChatResponse.response.usageMetadata?.totalTokenCount,
      },
    })
  })

  it('should return a stream completion response', async () => {
    const handlerOptions = { apiKey: 'test-api-key' }
    const handler = getHandler('gemini', handlerOptions)

    ;(GoogleGenerativeAI as any).mockImplementationOnce(() => ({
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: vi.fn(),
        generateContentStream: vi
          .fn()
          .mockResolvedValue(mockChatStreamResponse),
      }),
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
        id: null,
        created: fakeDate.getTime() / 1000,
        object: 'chat.completion.chunk',
        model,
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
                      '{"location":"Portland, OR","unit":"fahrenheit"}',
                    name: 'getCurrentWeather',
                  },
                  id: 'mockId',
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
          prompt_tokens: 80,
          completion_tokens: 22,
          total_tokens: 102,
        },
      },
    ])
  })
})
