import { APIResource } from "@anthropic-ai/sdk/resource.mjs";
import { BaseHandler, CompletionResponse, InputError, StreamCompletionResponse, AnthropicModel, CompletionResponseChunk, InvariantError } from "./types";
import Anthropic from "@anthropic-ai/sdk";
import { MessageCreateParams, MessageCreateParamsNonStreaming, MessageCreateParamsStreaming, ContentBlock, Message, MessageStream, TextBlock, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages.mjs";
import { getTimestamp } from "./utils";
import { CompletionParams } from "../chat"
import * as dotenv from 'dotenv'

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
    throw new Error(`Unknown stop reason: ${stopReason}`)
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
    throw new Error(`Unknown stop reason: ${stopReason}`)
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


export class AnthropicHandler extends BaseHandler {
  /**
   * 
   */
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
    if (typeof body.n === 'number' && body.n > 1) {
      throw new InputError(`Anthropic does not support setting 'n' greater than 1.`)
    }

    const apiKey = this.opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (apiKey === undefined) {
      throw new InputError("No Anthropic API key detected. Please define a 'GEMINI_API_KEY' environment variable or supply the API key using the 'apiKey' parameter.");
    }
    
    const stream = typeof body.stream === 'boolean' ? body.stream : undefined 
    const maxTokens = body.max_tokens ?? getDefaultMaxTokens(body.model)
    const client = new Anthropic(this.opts)
    const stopSequences = convertStopSequences(body.stop)
    const topP = typeof body.top_p === 'number' ? body.top_p : undefined
    const temperature = typeof body.temperature === 'number'
      // We divide by two because Anthropic's temperature range is 0 to 1, unlike OpenAI's, which is
      // 0 to 2.
      ? body.temperature / 2
      : undefined

    let messages: any[]
    let systemMessage: string | undefined
    if (body.messages[0].role === 'system') {
      systemMessage = body.messages[0].content
      messages = body.messages.slice(1)
    } else {
      messages = body.messages
    }

    if (stream === true) {
      const convertedBody: MessageCreateParamsStreaming = {
        max_tokens: maxTokens,
        messages,
        model: body.model,
        stop_sequences: stopSequences,
        temperature,
        top_p: topP,
        stream,
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
      }
      const created = getTimestamp()
      const response = await client.messages.create(convertedBody)
      return createCompletionResponseNonStreaming(response, created)
    }
  }
}
