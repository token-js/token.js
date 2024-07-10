import {
  Content,
  FinishReason,
  FunctionCallPart,
  FunctionCallingMode,
  FunctionDeclarationSchema,
  GenerateContentCandidate,
  GenerateContentRequest,
  GenerateContentResult,
  GenerateContentStreamResult,
  GoogleGenerativeAI,
  Part,
  TextPart,
  Tool,
  ToolConfig,
  UsageMetadata,
} from '@google/generative-ai'
import OpenAI from 'openai'
import {
  ChatCompletionChunk,
  ChatCompletionContentPart,
} from 'openai/resources/index.mjs'
import { ChatCompletionMessageToolCall } from 'openai/src/resources/index.js'

import { GeminiModel, ProviderCompletionParams } from '../chat'
import { CompletionResponse, StreamCompletionResponse } from '../userTypes'
import { BaseHandler } from './base'
import { InputError } from './types'
import { consoleWarn, getTimestamp, parseImage } from './utils'

export const convertContentsToParts = (
  contents: Array<ChatCompletionContentPart> | string | null | undefined,
  systemPrefix: string
): Part[] => {
  if (contents === null || contents === undefined) {
    return []
  }

  if (typeof contents === 'string') {
    return [
      {
        text: `${systemPrefix}${contents}`,
      },
    ]
  } else {
    return contents.map((part) => {
      if (part.type === 'text') {
        return {
          text: `${systemPrefix}${part.text}`,
        }
      } else if (part.type === 'image_url') {
        const imageData = parseImage(part.image_url.url)
        return {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.content,
          },
        }
      } else {
        throw new InputError(
          `Invalid content part type: ${
            (part as any).type
          }. Must be "text" or "image_url".`
        )
      }
    })
  }
}

// Google only supports the `model` and `user` roles, so we map everything else to `user`
// We handle the `system` role similarly to Anthropic where the first message is placed in the systemInstruction field
// if it is a system message, and the rest are treated as user messages but with a "System:" prefix.
export const convertRole = (
  role: 'function' | 'system' | 'user' | 'assistant' | 'tool'
) => {
  switch (role) {
    case 'assistant':
      return 'model'
    case 'function':
    case 'tool':
    case 'user':
    case 'system':
      return 'user'
    default:
      throw new InputError(`Unexpected message role: ${role}`)
  }
}

export const convertAssistantMessage = (
  message: OpenAI.Chat.Completions.ChatCompletionMessage
): Content => {
  const parts: (FunctionCallPart | TextPart)[] = message.tool_calls
    ? message.tool_calls.map((call): FunctionCallPart => {
        return {
          functionCall: {
            name: call.function.name,
            args: JSON.parse(call.function.arguments),
          },
        }
      })
    : []

  if (message.content !== null) {
    parts.push({
      text: message.content,
    })
  }

  return {
    role: convertRole(message.role),
    parts,
  }
}

export const convertMessageToContent = (
  message: OpenAI.Chat.Completions.ChatCompletionMessageParam,
  includeSystemPrefix: boolean
): Content => {
  switch (message.role) {
    case 'tool':
      return {
        role: convertRole(message.role),
        parts: [
          {
            functionResponse: {
              name: message.tool_call_id,
              response: JSON.parse(message.content),
            },
          },
        ],
      }
    case 'assistant':
      // Casting to the ChatCompletionMessage type here is fine because the role will only ever be
      // assistant if the object is a ChatCompletionMessage
      return convertAssistantMessage(
        message as OpenAI.Chat.Completions.ChatCompletionMessage
      )
    case 'user':
    case 'system':
      const systemPrefix =
        message.role === 'system' && includeSystemPrefix ? 'System:\n' : ''
      return {
        role: convertRole(message.role),
        parts: convertContentsToParts(message.content, systemPrefix),
      }
    default:
      throw new InputError(`Unexpected message role: ${message.role}`)
  }
}

export const convertMessagesToContents = (
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): {
  contents: Content[]
  systemInstruction: Content | undefined
} => {
  const clonedMessages = structuredClone(messages)

  // Pop the first element from the user-defined `messages` array if it begins with a 'system'
  // message. The returned element will be used for Gemini's `systemInstruction` parameter. We only pop the
  // system message if it's the first element in the array so that the order of the messages remains
  // unchanged.
  let systemInstruction: Content | undefined
  if (clonedMessages.length > 0 && clonedMessages[0].role === 'system') {
    const systemMessage = clonedMessages.shift()
    systemInstruction =
      systemMessage !== undefined
        ? convertMessageToContent(systemMessage, false)
        : undefined
  }

  return {
    contents: clonedMessages.map((message) =>
      convertMessageToContent(message, true)
    ),
    systemInstruction,
  }
}

export const convertFinishReason = (
  finishReason: FinishReason,
  parts: Part[]
): 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' => {
  if (parts.some((part) => part.functionCall !== undefined)) {
    return 'tool_calls'
  }

  switch (finishReason) {
    case FinishReason.STOP:
      return 'stop'
    case FinishReason.MAX_TOKENS:
      return 'length'
    case FinishReason.SAFETY:
      return 'content_filter'
    case FinishReason.OTHER:
    case FinishReason.FINISH_REASON_UNSPECIFIED:
    case FinishReason.RECITATION:
      return 'stop'
    default:
      return 'stop'
  }
}

export const convertToolCalls = (
  candidate: GenerateContentCandidate
): Array<ChatCompletionMessageToolCall> | undefined => {
  const toolCalls = candidate.content.parts
    .filter((part) => part.functionCall !== undefined)
    .map((part, index) => {
      return {
        id: part.functionCall!.name,
        index,
        function: {
          arguments: JSON.stringify(part.functionCall!.args),
          name: part.functionCall!.name,
        },
        // Casting as 'function' just fixes a minor type issue
        type: 'function' as 'function',
      }
    })

  if (toolCalls.length > 0) {
    return toolCalls
  } else {
    return undefined
  }
}

export const convertStreamToolCalls = (
  candidate: GenerateContentCandidate
): Array<ChatCompletionChunk.Choice.Delta.ToolCall> | undefined => {
  return convertToolCalls(candidate)?.map((toolCall, index) => {
    return {
      ...toolCall,
      index,
    }
  })
}

export const convertResponseMessage = (
  candidate: GenerateContentCandidate
): CompletionResponse['choices'][number]['message'] => {
  return {
    content: candidate.content.parts.map((part) => part.text).join(''),
    role: 'assistant',
    tool_calls: convertToolCalls(candidate),
  }
}

export const convertUsageData = (
  usageMetadata: UsageMetadata
): CompletionResponse['usage'] => {
  return {
    completion_tokens: usageMetadata.candidatesTokenCount,
    prompt_tokens: usageMetadata.promptTokenCount,
    total_tokens: usageMetadata.totalTokenCount,
  }
}

export const convertToolConfig = (
  toolChoice:
    | OpenAI.Chat.Completions.ChatCompletionToolChoiceOption
    | undefined,
  tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined
): ToolConfig => {
  // If tool choise is an object, then it is a required specific function
  if (typeof toolChoice === 'object') {
    return {
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
        allowedFunctionNames: [toolChoice.function.name],
      },
    }
  }

  switch (toolChoice) {
    case 'auto':
      return {
        functionCallingConfig: {
          mode: FunctionCallingMode.AUTO,
        },
      }
    case 'none':
      return {
        functionCallingConfig: {
          mode: FunctionCallingMode.NONE,
        },
      }
    case 'required':
      return {
        functionCallingConfig: {
          mode: FunctionCallingMode.ANY,
        },
      }
    default:
      return {
        functionCallingConfig: {
          mode:
            tools && tools?.length > 0
              ? FunctionCallingMode.AUTO
              : FunctionCallingMode.NONE,
        },
      }
  }
}

export const convertTools = (
  tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined
): Tool[] | undefined => {
  if (tools === undefined) {
    return undefined
  }

  return tools.map((tool) => {
    return {
      functionDeclarations: [
        {
          name: tool.function.name,
          description: tool.function.description,
          // We can cast this directly to Google's type because they both use JSON Schema
          // OpenAI just uses a generic Record<string, unknown> type for this.
          parameters: tool.function
            .parameters as any as FunctionDeclarationSchema,
        },
      ],
    }
  })
}

export const convertResponse = async (
  result: GenerateContentResult,
  model: string,
  timestamp: number
): Promise<CompletionResponse> => {
  return {
    id: null,
    object: 'chat.completion',
    created: timestamp,
    model,
    choices:
      result.response.candidates?.map((candidate) => {
        return {
          index: candidate.index,
          finish_reason: candidate.finishReason
            ? convertFinishReason(
                candidate.finishReason,
                candidate.content.parts
              )
            : 'stop',
          message: convertResponseMessage(candidate),
          // Google does not support logprobs
          logprobs: null,
          // There are also some other fields that Google returns that are not supported in the OpenAI format such as citations and safety ratings
        }
      }) ?? [],
    usage: result.response.usageMetadata
      ? convertUsageData(result.response.usageMetadata)
      : undefined,
  }
}

async function* convertStreamResponse(
  result: GenerateContentStreamResult,
  model: string,
  timestamp: number
): StreamCompletionResponse {
  for await (const chunk of result.stream) {
    const text = chunk.text()
    yield {
      id: null,
      object: 'chat.completion.chunk',
      created: timestamp,
      model,
      choices:
        chunk.candidates?.map((candidate) => {
          return {
            index: candidate.index,
            finish_reason: candidate.finishReason
              ? convertFinishReason(
                  candidate.finishReason,
                  candidate.content.parts
                )
              : 'stop',
            delta: {
              content: text,
              tool_calls: convertStreamToolCalls(candidate),
              role: 'assistant',
            },
            logprobs: null,
          }
        }) ?? [],
      usage: chunk.usageMetadata
        ? convertUsageData(chunk.usageMetadata)
        : undefined,
    }
  }
}

// To support a new provider, we just create a handler for them extending the BaseHandler class and implement the create method.
// Then we update the Handlers object in src/handlers/utils.ts to include the new handler.
export class GeminiHandler extends BaseHandler<GeminiModel> {
  async create(
    body: ProviderCompletionParams<'gemini'>
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    this.validateInputs(body)

    const apiKey = this.opts.apiKey ?? process.env.GEMINI_API_KEY
    if (apiKey === undefined) {
      throw new InputError(
        'API key is required for Gemini, define GEMINI_API_KEY in your environment or specifty the apiKey option.'
      )
    }

    if (this.opts.baseURL) {
      consoleWarn(
        `The 'baseUrl' will be ignored by Gemini because it does not support this field.`
      )
    }

    const responseMimeType =
      body.response_format?.type === 'json_object'
        ? 'application/json'
        : undefined
    const stop = typeof body.stop === 'string' ? [body.stop] : body.stop
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: body.model,
      generationConfig: {
        maxOutputTokens: body.max_tokens ?? undefined,
        temperature: body.temperature ?? undefined,
        topP: body.top_p ?? undefined,
        stopSequences: stop ?? undefined,
        candidateCount: body.n ?? undefined,
        responseMimeType,
      },
      // Google also supports configurable safety settings which do not fit into the OpenAI format (this was an issue for us in the past, so we'll likely need to address it at some point)
      // Google also supports cached content which does not fit into the OpenAI format
    })

    const { contents, systemInstruction } = convertMessagesToContents(
      body.messages
    )
    const params: GenerateContentRequest = {
      contents,
      toolConfig: convertToolConfig(body.tool_choice, body.tools),
      tools: convertTools(body.tools),
      systemInstruction,
    }

    const timestamp = getTimestamp()
    if (body.stream) {
      const result = await model.generateContentStream(params)
      return convertStreamResponse(result, body.model, timestamp)
    } else {
      const result = await model.generateContent(params)
      return convertResponse(result, body.model, timestamp)
    }
  }
}
