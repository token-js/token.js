import { ApiMetaBilledUnits, ChatRequest, ChatStreamRequest, FinishReason, Message, NonStreamedChatResponse, StreamedChatResponse } from "cohere-ai/api";
import { CompletionParams } from "../chat";
import { BaseHandler, CompletionResponse, CompletionResponseChunk, InputError, InvariantError, LLMChatModel, MessageRole, StreamCompletionResponse } from "./types";
import { consoleWarn, getTimestamp } from "./utils";
import { ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { CohereClient } from "cohere-ai";
import { Stream } from "cohere-ai/core";

type CohereMessageRole = "CHATBOT" | "SYSTEM" | "USER" | "TOOL"

const convertRole = (
  role: MessageRole
): CohereMessageRole => {
  if (role === 'assistant') {
    return 'CHATBOT'
  } else if (role === 'system') {
    return 'SYSTEM'
  } else if (role === 'tool') {
    return 'TOOL'
  } else if (role === 'user') {
    return 'USER'
  } else {
    throw new InputError(`Unknown role: ${role}`)
  }
}

const convertFinishReason = (
  finishReason?: FinishReason
): CompletionResponse['choices'][0]['finish_reason'] => {
  if (finishReason === 'COMPLETE' || finishReason === 'USER_CANCEL' || finishReason === 'STOP_SEQUENCE') {
    return 'stop'
  } else if (finishReason === 'MAX_TOKENS') {
    return 'length'
  } else if (finishReason === 'ERROR_TOXIC') {
    return 'content_filter'
  } else if (finishReason === 'ERROR_LIMIT') {
    // OpenAI throws an error in when the model's context limit is reached, so we do too for consistency.
    throw new Error(`The generation could not be completed because the model’s context limit was reached.`)
  } else if (finishReason === 'ERROR') {
    throw new Error(`The generation could not be completed due to an error.`)
  } else {
    return 'unknown'
  }
}

const popLastUserMessageContentString = (
  messages: CompletionParams['messages']
): string => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message.role === 'user') {
      if (typeof message.content === 'string') {
        messages.splice(i, 1) // Remove the object from the array
        return message.content
      } else if (Array.isArray(message.content)) {
        for (const e of message.content) {
          if (e.type === 'text') {
            messages.splice(i, 1) // Remove the object from the array
            return e.text
          }
        }
      }
    }
  }

  // Return a placeholder string if the user didn't include a text message. We include a whitespace
  // in the string because Cohere throws an error if the user's message contains zero tokens.
  return "Empty"
}

const convertStopSequences = (
  stop?: CompletionParams['stop']
): Array<string> | undefined => {
  if (stop === null || stop === undefined) {
    return undefined
  } else if (typeof stop === 'string') {
    return [stop]
  } else if (Array.isArray(stop) && stop.every(e => typeof e === 'string')) {
    return stop
  } else {
    throw new Error(`Unknown stop sequence type: ${stop}`)
  }
}

const getUsageTokens = (
  billedUnits?: ApiMetaBilledUnits
): CompletionResponse['usage'] => {
  if (billedUnits && typeof billedUnits.inputTokens === 'number' && typeof billedUnits.outputTokens === 'number') {
    const { inputTokens, outputTokens } = billedUnits
    return {
      completion_tokens: outputTokens,
      prompt_tokens: inputTokens,
      total_tokens: outputTokens + inputTokens
    }
  } else {
    return undefined
  }
}

const convertMessages = (
  messages: CompletionParams['messages']
): {messages: Array<Message>, lastUserMessage: string } => {
  const clonedMessages = structuredClone(messages)
  const lastUserMessage = popLastUserMessageContentString(clonedMessages)
  const chatHistory: ChatRequest['chatHistory'] = []
  for (const message of clonedMessages) {
    if (typeof message.content === 'string') {
      chatHistory.push({
        role: convertRole(message.role),
        message: message.content
      })
    } else if (message.content) {
      for (const e of message.content) {
        if (e.type === 'text') {
          chatHistory.push({
            role: convertRole(message.role),
            message: e.text
          })
        } else {
          throw new InputError(`Cohere does not support images. Please remove them from your prompt message.`)
        }
      }
    }
  }

  return { messages: chatHistory, lastUserMessage }
}

async function* createCompletionResponseStreaming(
  response: Stream<StreamedChatResponse>,
  model: LLMChatModel,
  created: number
): StreamCompletionResponse {
  let id: string | undefined

  for await (const chunk of response) {
    if (chunk.eventType === 'stream-start') {
      id = chunk.generationId
      yield {
        choices: [{
          index: 0,
          finish_reason: null,
          logprobs: null,
          delta: {}
        }],
        created,
        model,
        id: chunk.generationId,
        object: 'chat.completion.chunk',
      }
    }
    
    if (id === undefined) {
      // Should never happen because the 'stream-start' event, where the `id` field is assigned,
      // occurs first.
      throw new InvariantError(`The generated ID is undefined.`)
    }
    
    if (chunk.eventType === 'stream-end') {
      yield {
        choices: [{
          index: 0,
          finish_reason: convertFinishReason(chunk.finishReason),
          logprobs: null,
          // We return an empty delta because the returned text in the 'stream-end' event contains
          // the aggregated response.
          delta: {}
        }],
        created,
        model,
        id,
        object: 'chat.completion.chunk',
      }
    } else if (chunk.eventType === 'text-generation') {
      yield {
        choices: [{
          index: 0,
          finish_reason: null,
          logprobs: null,
          delta: {
            content: chunk.text,
            role: 'assistant'
          }
        }],
        created,
        model,
        id,
        object: 'chat.completion.chunk',
      }
    }
  }
}

export class CohereHandler extends BaseHandler {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
    if (this.opts.baseURL) {
      consoleWarn(`The 'baseUrl' will be ignored by Cohere because it does not support this field.`)
    }

    if (typeof body.n === 'number' && body.n > 1) {
      throw new InputError(`Cohere does not support setting 'n' greater than 1.`)
    }

    const apiKey = this.opts.apiKey ?? process.env.COHERE_API_KEY;
    if (apiKey === undefined) {
      throw new InputError("No Cohere API key detected. Please define an 'COHERE_API_KEY' environment variable or supply the API key using the 'apiKey' parameter.");
    }

    const maxTokens = body.max_tokens ?? undefined
    const p = body.top_p ?? undefined
    const stopSequences = convertStopSequences(body.stop)
    const temperature = typeof body.temperature === 'number'
      // We divide by two because Cohere's temperature range is 0 to 1 and the input temperature
      // range is 0 to 2.
      ? body.temperature / 2
      : undefined

    const { messages, lastUserMessage } = convertMessages(body.messages)

    const input = {
      maxTokens,
      message: lastUserMessage,
      chatHistory: messages,
      model: body.model,
      stopSequences,
      temperature,
      p
    }
    const cohere = new CohereClient({
      token: apiKey
    });

    if (body.stream === true) {
      const created = getTimestamp()
      const response = await cohere.chatStream(input);
      return createCompletionResponseStreaming(response, body.model, created)
    } else {
      const created = getTimestamp()
      const response = await cohere.chat(input);

      const usage = getUsageTokens(response.meta?.billedUnits)
      const convertedResponse: CompletionResponse = {
        object: 'chat.completion',
        choices: [{
          finish_reason: convertFinishReason(response.finishReason),
          index: 0,
          logprobs: null,
          message: {
            role: 'assistant',
            content: response.text
          }
        }],
        created,
        id: response.generationId ?? null,
        model: body.model,
        usage
      }

      return convertedResponse
    }

  }
}
