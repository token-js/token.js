import MistralClient, { ChatCompletionResponse, ChatCompletionResponseChunk, ChatRequest, Message } from "@mistralai/mistralai";
import { CompletionParams } from "../chat";
import { BaseHandler, CompletionResponse, InputError, StreamCompletionResponse } from "./types";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { ChatCompletionContentPartText } from "openai/src/resources/index.js";

export const MISTRAL_PREFIX = 'mistral/'

const convertMessages = (messages: ChatCompletionMessageParam[]): Array<Message> => {
  return messages.map((message) => {

    if (typeof message.content !== 'string' && message.content?.some((part) => part.type === 'image_url')) {
      throw new Error("Image inputs are not supported by Mistral")
    }

    if (message.role === 'tool') {
      throw new Error("Tools are not currently supported")
    }

    if (message.role === 'system' || message.role === 'assistant') {
      return {
        role: message.role,
        content: message.content ?? ''
      }
    } else if (message.role === 'user') {
      const content = typeof message.content === 'string' ? message.content : message.content?.map((m) => (m as ChatCompletionContentPartText).text)
      return {
        role: message.role,
        content
      }
    } else {
      throw new Error("Function responses are not supported.")
    }
  })
}

async function *toStreamResponse(result: AsyncGenerator<ChatCompletionResponseChunk, void, unknown>): StreamCompletionResponse {
  for await (const chunk of result) {
    yield { 
      id: chunk.id,
      created: chunk.created,
      object: chunk.object,
      model: chunk.model,
      choices: chunk.choices.map((choice) => {
        return {
          index: choice.index,
          delta: {
            role: 'assistant',
            content: choice.delta.content,
          },
          finish_reason: choice.finish_reason as any,
          logprobs: null
        }
      }),
      usage: chunk.usage ?? undefined
    }
  }
}

const toCompletionResponse = (result: ChatCompletionResponse): CompletionResponse => {
  return { 
    id: result.id,
    created: result.created,
    object: result.object,
    model: result.model,
    choices: result.choices.map((choice) => {
      return {
        index: choice.index,
        message: {
          role: 'assistant',
          content: choice.message.content,
          tool_calls: undefined,
        },
        finish_reason: choice.finish_reason as any,
        logprobs: null
      }
    }),
    usage: result.usage
  }
}

export class MistralHandler extends BaseHandler {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
    const apiKey = this.opts.apiKey ?? process.env.MISTRAL_API_KEY;

    if (apiKey === undefined) {
      throw new InputError("API key is required for Mistral, define MISTRAL_API_KEY in your environment or specifty the apiKey option.");
    }

    const endpoint = this.opts.baseURL ?? undefined
    const client = new MistralClient(apiKey, endpoint);
    const model = body.model.replace(MISTRAL_PREFIX, '')

    const temperature = typeof body.temperature === 'number'
      // We divide by two because Mistral's temperature range is 0 to 1 and the input temperature
      // range is 0 to 2.
      ? body.temperature / 2
      : undefined

    const options: ChatRequest = {
      model,
      messages: convertMessages(body.messages),
      temperature,
      maxTokens: body.max_tokens ?? undefined,
      topP: body.top_p ?? undefined,
      // Mistral does not support `stop`
    }

    if (body.stream) {
      const chatResponseStream = client.chatStream(options);
      return toStreamResponse(chatResponseStream)
    } else {
      const chatResponse = await client.chat(options);
      return toCompletionResponse(chatResponse)
    }
  }
}