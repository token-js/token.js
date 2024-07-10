import { IncomingMessage } from 'http'

import axios from 'axios'

import {
  AI21Model,
  CompletionParams,
  LLMChatModel,
  ProviderCompletionParams,
} from '../chat'
import { CompletionResponse, StreamCompletionResponse } from '../userTypes'
import { BaseHandler } from './base'
import { InputError } from './types'
import { getTimestamp } from './utils'

type AI21ChatCompletionParams = {
  model: string
  messages: {
    role: 'user' | 'assistant' | 'system'
    content: string
  }[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  stop?: string | string[]
  n?: number
  stream?: boolean
  logprobs?: never
  top_logprobs?: never
}

type AI21ChatCompletionResponseNonStreaming = {
  id: string
  choices: {
    index: number
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: 'stop' | 'length'
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

type AI21ChatCompletionResponseStreaming = {
  id: string
  choices: [
    {
      index: number
      delta: { role?: 'assistant'; content?: string }
      finish_reason: 'stop' | 'length' | null
    }
  ]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const convertMessages = (
  messages: CompletionParams['messages']
): AI21ChatCompletionParams['messages'] => {
  const output: AI21ChatCompletionParams['messages'] = []

  let previousRole: 'user' | 'assistant' = 'user'
  let currentMessages: Array<string> = []
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (i === 0 && message.role === 'system') {
      output.push({
        role: 'system',
        content: message.content,
      })
    } else if (
      message.role === 'user' ||
      message.role === 'assistant' ||
      message.role === 'system'
    ) {
      // AI21's documentation says to only use the `system` role for the first
      // message in their `messages` array. If the user defines system messages later in their
      // prompt, we replace it with the `user` role and prepend 'System: ' to its content. We do
      // this instead of putting every system message in AI21's `system` string parameter so that
      // the order of the user-defined `messages` remains the same, even when the system messages
      // are interspersed with messages from other roles.
      const newRole =
        message.role === 'user' || message.role === 'system'
          ? 'user'
          : 'assistant'

      if (previousRole !== newRole) {
        output.push({
          role: previousRole,
          content: currentMessages.join('\n'),
        })
        currentMessages = []
      }

      if (typeof message.content === 'string') {
        const text =
          message.role === 'system'
            ? `System: ${message.content}`
            : message.content
        currentMessages.push(text)
      } else if (Array.isArray(message.content)) {
        const convertedContent = message.content.map((e) => {
          if (e.type === 'text') {
            const text =
              message.role === 'system' ? `System: ${e.text}` : e.text
            return text
          } else {
            throw new InputError(`AI12 does not support images.`)
          }
        })
        currentMessages.push(...convertedContent)
      }

      previousRole = newRole
    }
  }

  if (currentMessages.length > 0) {
    output.push({
      role: previousRole,
      content: currentMessages.join('\n'),
    })
  }

  return output
}

async function* createCompletionResponseStreaming(
  responseStream: IncomingMessage,
  model: LLMChatModel,
  created: number
): StreamCompletionResponse {
  for await (const chunk of responseStream) {
    const decodedText = new TextDecoder().decode(chunk)
    if (decodedText.startsWith('data: [DONE]')) {
      return
    }

    const responses: Array<AI21ChatCompletionResponseStreaming> = decodedText
      .split('\n')
      .filter((line) => line.trim().startsWith('data:'))
      .map((line) => JSON.parse(line.replace(/^data:\s*/, '').trim()))

    let content: string = ''
    for (const response of responses) {
      for (const choice of response.choices) {
        if (typeof choice.delta.content === 'string') {
          content += choice.delta.content
        }
      }
    }

    const { id, choices } = responses[responses.length - 1]
    const finish_reason = choices[0].finish_reason

    yield {
      choices: [
        {
          index: 0,
          finish_reason,
          logprobs: null,
          delta: {
            role: 'assistant',
            content,
          },
        },
      ],
      id,
      created,
      model,
      object: 'chat.completion.chunk',
    }
  }
}

export class AI21Handler extends BaseHandler<AI21Model> {
  validateInputs(body: CompletionParams): void {
    super.validateInputs(body)

    if (typeof body.n === 'number' && (body.n > 16 || body.n < 0)) {
      throw new InputError(
        `AI21 requires that the 'n' parameter is a value between 0 and 16, inclusive. Instead, got: ${body.n}`
      )
    }

    if (typeof body.n === 'number' && body.stream === true && body.n > 1) {
      throw new InputError(
        `AI21 requires that 'n' equals '1' when streaming is enabled. Received an 'n' value of: ${body.n}`
      )
    }

    for (const message of body.messages) {
      if (Array.isArray(message.content)) {
        for (const e of message.content) {
          if (e.type === 'image_url') {
            throw new InputError(
              `Model '${body.model}' does not support images. Remove any images from the prompt or use a different model.`
            )
          }
        }
      }
    }
  }

  async create(
    body: ProviderCompletionParams<'ai21'>
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    this.validateInputs(body)

    const apiKey = this.opts.apiKey ?? process.env.AI21_API_KEY
    if (apiKey === undefined) {
      throw new InputError(
        "No AI21 API key detected. Please define an 'AI21_API_KEY' environment variable or supply the API key using the 'apiKey' parameter."
      )
    }

    const messages = convertMessages(body.messages)

    const params: AI21ChatCompletionParams = {
      max_tokens: body.max_tokens ?? undefined,
      messages,
      model: body.model,
      n: body.n ?? undefined,
      stop: body.stop ?? undefined,
      temperature: body.temperature ?? undefined,
      top_p: body.top_p ?? undefined,
      stream: body.stream ?? undefined,
    }

    const created = getTimestamp()
    const axiosResponse = await axios.post(
      'https://api.ai21.com/studio/v1/chat/completions',
      params,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        responseType: body.stream === true ? 'stream' : undefined,
      }
    )

    if (body.stream === true) {
      return createCompletionResponseStreaming(
        axiosResponse.data,
        body.model,
        created
      )
    } else {
      const response: AI21ChatCompletionResponseNonStreaming =
        axiosResponse.data

      const convertedChoices = response.choices.map((choice) => {
        return {
          ...choice,
          logprobs: null,
        }
      })
      const convertedResponse: CompletionResponse = {
        choices: convertedChoices,
        id: response.id,
        usage: response.usage,
        created,
        model: body.model,
        object: 'chat.completion',
      }

      return convertedResponse
    }
  }
}
