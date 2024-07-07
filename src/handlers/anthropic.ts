import { BaseHandler, CompletionResponse, InputError, StreamCompletionResponse, AnthropicModel, CompletionResponseChunk, InvariantError, ConfigOptions } from "./types";
import Anthropic from "@anthropic-ai/sdk";
import { MessageCreateParamsNonStreaming, MessageCreateParamsStreaming, ContentBlock, Message, MessageStream, TextBlock, ToolUseBlock, TextBlockParam, ImageBlockParam } from "@anthropic-ai/sdk/resources/messages.mjs";
import { consoleWarn, fetchThenParseImage, getTimestamp } from "./utils";
import { CompletionParams } from "../chat"
import * as dotenv from 'dotenv'
import { ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";

dotenv.config()

export const createCompletionResponseNonStreaming = (response: Message, created: number): CompletionResponse => {
  const finishReason = toFinishReasonNonStreaming(response.stop_reason)
  const chatMessage = toChatCompletionChoiceMessage(response.content, response.role)
  const choice = {
    index: 0,
    logprobs: null,
    message: chatMessage,
    finish_reason: finishReason
  }
  const converted: CompletionResponse = {
    id: response.id,
    choices: [choice],
    created,
    model: response.model,
    object: 'chat.completion',
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens
    },
  }

  return converted
}

export async function* createCompletionResponseStreaming(
  response: MessageStream,
  created: number
): StreamCompletionResponse {
  let message: Message | undefined

  for await (const chunk of response) {
    if (chunk.type === 'message_start') {
      message = chunk.message
      // Yield the first element
      yield {
          choices: [{
          index: 0,
          finish_reason: toFinishReasonStreaming(chunk.message.stop_reason),
          logprobs: null,
          delta: {}
        }],
        created,
        model: message.model,
        id: message.id,
        object: 'chat.completion.chunk',
      }
    }

    if (message === undefined) {
      throw new InvariantError(`Message is undefined.`)
    }

    let newStopReason: Message['stop_reason'] | undefined
    let textBlock: TextBlock | undefined

    if (chunk.type === 'content_block_start') {
      if (isToolUseBlock(chunk.content_block)) {
        throw new Error(`Tool calls are not supported yet.`)
      }
      textBlock = {
        type: 'text',
        text: chunk.content_block.text
      }
    } else if (chunk.type === 'content_block_delta') {
      if (chunk.delta.type === 'input_json_delta') {
        throw new Error(`Tool calls are not supported yet.`)
      }
      textBlock = {
        type: 'text',
        text: chunk.delta.text
      }
    } else if (chunk.type === 'message_delta') {
      newStopReason = chunk.delta.stop_reason
    }

    const stopReason = newStopReason !== undefined ? newStopReason : message.stop_reason
    const finishReason = toFinishReasonStreaming(stopReason)

    const content = textBlock !== undefined ? [textBlock] : []
    const chatMessage = toChatCompletionChoiceMessage(content, message.role)
    const delta = textBlock !== undefined ? {
      content: chatMessage.content,
      role: chatMessage.role
    } : {}

    const chunkChoice = {
      index: 0,
      finish_reason: finishReason,
      logprobs: null,
      delta,
    }

    yield {
      choices: [chunkChoice],
      created,
      model: message.model,
      id: message.id,
      object: 'chat.completion.chunk',
      // Our SDK doesn't currently support OpenAI's `stream_options`, so we don't include a `usage`
      // field here.
    }
  }
}

const isTextBlock = (contentBlock: ContentBlock): contentBlock is TextBlock => {
  return contentBlock.type === 'text'
}

const isToolUseBlock = (contentBlock: ContentBlock): contentBlock is ToolUseBlock => {
  return contentBlock.type === 'tool_use'
}

const toChatCompletionChoiceMessage = (content: Message['content'], role: Message['role']): CompletionResponse['choices'][0]['message'] => {
  const textBlocks = content.filter(isTextBlock)
  if (textBlocks.length > 1) {
    throw new Error(`Detected more than one text block. Should not happen when tool calls haven't been implemented.`)
  } else if (textBlocks.length === 0) {
    // There can be zero text blocks if either of these scenarios happen:
    // - A stop sequence is immediately hit, in which case Anthropic's `content` array is empty. In this
    //   scenario, OpenAI returns an empty string `content` field.
    // - There's only tool call responses. In this scenario, OpenAI returns a `content` field of `null`.
    const messageContent = content.every(isToolUseBlock) ? null : ''
    return {
      role,
      content: messageContent
    }
  } else {
    const textBlock = textBlocks[0]
    return {
      role,
      content: textBlock.text
    }
  }
}

const toFinishReasonNonStreaming = (stopReason: Message['stop_reason']): CompletionResponse['choices'][0]['finish_reason'] => {
  if (stopReason === null) {
    // Anthropic's documentation says that the `stop_reason` will never be `null` for non-streaming
    // calls.
    throw new InvariantError(`Detected a 'stop_reason' value of 'null' during a non-streaming call.`)
  }

  if (stopReason === "end_turn" || stopReason === "stop_sequence") {
    return 'stop'
  } else if (stopReason === 'max_tokens') {
    return 'length'
  } else if (stopReason === "tool_use") {
    return 'tool_calls'
  } else {
    return 'unknown'
  }
}

const toFinishReasonStreaming = (stopReason: Message['stop_reason']): CompletionResponseChunk['choices'][0]['finish_reason'] => {
  if (stopReason === null) {
    return null
  } else if (stopReason === "end_turn" || stopReason === "stop_sequence") {
    return 'stop'
  } else if (stopReason === 'max_tokens') {
    return 'length'
  } else if (stopReason === "tool_use") {
    return 'tool_calls'
  } else {
    return 'unknown'
  }
}

export const getDefaultMaxTokens = (model: string): number => {
  if (model === 'claude-3-5-sonnet-20240620'
|| model === 'claude-3-opus-20240229'
|| model === 'claude-3-sonnet-20240229'
|| model === 'claude-3-haiku-20240307'
|| model === 'claude-2.1'
|| model === 'claude-2.0'
|| model === 'claude-instant-1.2') {
  return 4096
} else {
  throw new InputError(`Unknown model: ${model}`)
}
}

export const convertMessages = async (
  messages: CompletionParams['messages']
): Promise<{messages: MessageCreateParamsNonStreaming['messages'], systemMessage: string | undefined}> => {
  const output: MessageCreateParamsNonStreaming['messages'] = [];
  const clonedMessages = structuredClone(messages)

  // Pop the first element from the user-defined `messages` array if it begins with a 'system'
  // message. The returned element will be used for Anthropic's `system` parameter. We only pop the
  // system message if it's the first element in the array so that the order of the messages remains
  // unchanged.
  let systemMessage: string | undefined
  if (clonedMessages.length > 0 && clonedMessages[0].role === 'system') {
    systemMessage = clonedMessages[0].content
    clonedMessages.shift();
  }

  // Anthropic requires that the first message in the array is from a 'user' role, so we inject a
  // placeholder user message if the array doesn't already begin with a message from a 'user' role.
  if (clonedMessages[0].role !== 'user' && clonedMessages[0].role !== 'system') {
    clonedMessages.unshift({
      role: 'user',
      content: 'Empty'
    })
  }

  let previousRole: 'user' | 'assistant' = 'user'
  let currentParams: Array<TextBlockParam | ImageBlockParam> = []
  for (const message of clonedMessages) {
    if (message.role === 'user' || message.role === 'assistant' || message.role === 'system')  {
      // Anthropic doesn't support the `system` role in their `messages` array, so if the user
      // defines system messages, we replace it with the `user` role and prepend 'System: ' to its
      // content. We do this instead of putting every system message in Anthropic's `system` string
      // parameter so that the order of the user-defined `messages` remains the same, even when the
      // system messages are interspersed with messages from other roles.
      const newRole = message.role === 'user' || message.role === 'system' ? 'user' : 'assistant'

      if (previousRole !== newRole) {
        output.push({
          role: previousRole,
          content: currentParams
        })
        currentParams = []
      }

      if (typeof message.content === 'string') {
        const text = message.role === 'system' ? `System: ${message.content}` : message.content
        currentParams.push({
          type: 'text',
          text: text
        })
      } else if (Array.isArray(message.content)) {
        const convertedContent: Array<TextBlockParam | ImageBlockParam> = await Promise.all(message.content.map(async e => {
          if (e.type === 'text') {
            const text = message.role === 'system' ? `System: ${e.text}` : e.text
            return {
              type: 'text',
              text
            }
          } else {
            const parsedImage = await fetchThenParseImage(e.image_url.url)
            return {
              type: 'image',
              source: {
                data: parsedImage.content,
                media_type: parsedImage.mimeType,
                type: 'base64'
              }
            }
          }
        }))
        currentParams.push(...convertedContent)
      }

      previousRole = newRole
    }
  }

  if (currentParams.length > 0) {
    output.push({
      role: previousRole,
      content: currentParams
    })
  }

  return { messages: output, systemMessage }
};

export const convertStopSequences = (
  stop?: CompletionParams['stop']
): Array<string> | undefined => {
  if (stop === null || stop === undefined) {
    return undefined
  } else if (typeof stop === 'string') {
    return [stop]
  } else if (Array.isArray(stop) && stop.every(e => typeof e === 'string')) {
    return stop
  } else {
    throw new Error(`Unknown stop sequence: ${stop}`)
  }
}

const getApiKey = (
  apiKey?: string
): string | undefined => {
  return apiKey ?? process.env.ANTHROPIC_API_KEY
}

const validateInputs = (
  body: CompletionParams,
  opts: ConfigOptions
): void => {
  if (typeof body.n === 'number' && body.n > 1) {
    throw new InputError(`Anthropic does not support setting 'n' greater than 1.`)
  }

  const apiKey = getApiKey(opts.apiKey)
  if (apiKey === undefined) {
    throw new InputError("No Anthropic API key detected. Please define an 'ANTHROPIC_API_KEY' environment variable or supply the API key using the 'apiKey' parameter.");
  }
  
  let logImageDetailWarning: boolean = false
  for (const message of body.messages) {
    if (Array.isArray(message.content)) {
      for (const e of message.content) {
        if (e.type === 'image_url') {
          if (e.image_url.detail !== undefined && e.image_url.detail !== 'auto') {
            logImageDetailWarning = true
          }

          if (body.model === 'claude-instant-1.2' || body.model === 'claude-2.0' || body.model === 'claude-2.1') {
            throw new InputError(`Model '${body.model}' does not support images. Remove any images from the prompt or use Claude version 3 or later.`)
          }
        }
      }
    }
  }

  if (logImageDetailWarning) {
    consoleWarn(`Anthropic does not support the 'detail' field for images. The default image quality will be used.`)
  }
}

export class AnthropicHandler extends BaseHandler {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
    validateInputs(body, this.opts)

    const stream = typeof body.stream === 'boolean' ? body.stream : undefined 
    const maxTokens = body.max_tokens ?? getDefaultMaxTokens(body.model)
    const client = new Anthropic({apiKey: getApiKey(this.opts.apiKey)! })
    const stopSequences = convertStopSequences(body.stop)
    const topP = typeof body.top_p === 'number' ? body.top_p : undefined
    const temperature = typeof body.temperature === 'number'
      // We divide by two because Anthropic's temperature range is 0 to 1, unlike OpenAI's, which is
      // 0 to 2.
      ? body.temperature / 2
      : undefined
    const {messages, systemMessage} = await convertMessages(body.messages)

    if (stream === true) {
      const convertedBody: MessageCreateParamsStreaming = {
        max_tokens: maxTokens,
        messages,
        model: body.model,
        stop_sequences: stopSequences,
        temperature,
        top_p: topP,
        stream,
        system: systemMessage
      }
      const created = getTimestamp()
      const response = client.messages.stream(convertedBody)

      return createCompletionResponseStreaming(response, created)
    } else {
      const convertedBody: MessageCreateParamsNonStreaming = {
        max_tokens: maxTokens,
        messages,
        model: body.model,
        stop_sequences: stopSequences,
        temperature,
        top_p: topP,
        system: systemMessage
      }
      const created = getTimestamp()
      const response = await client.messages.create(convertedBody)
      return createCompletionResponseNonStreaming(response, created)
    }
  }
}
