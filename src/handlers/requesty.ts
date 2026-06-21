import OpenAI from 'openai'

import { RequestyModel, ProviderCompletionParams } from '../chat/index.js'
import {
  CompletionResponse,
  StreamCompletionResponse,
} from '../userTypes/index.js'
import { BaseHandler } from './base.js'
import { InputError } from './types.js'

// Requesty is an OpenAI-compatible LLM router, so we reuse the OpenAI SDK for this handler.
export class RequestyHandler extends BaseHandler<RequestyModel> {
  validateInputs(body: ProviderCompletionParams<'requesty'>): void {
    super.validateInputs(body)
  }

  async create(
    body: ProviderCompletionParams<'requesty'>
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    this.validateInputs(body)

    const apiKey = this.opts.apiKey ?? process.env.REQUESTY_API_KEY
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://router.requesty.ai/v1',
      defaultHeaders: {
        'HTTP-Referer': 'docs.tokenjs.ai',
        'X-Title': 'Token.js',
      },
    })

    if (apiKey === undefined) {
      throw new InputError(
        'API key is required for Requesty, define REQUESTY_API_KEY in your environment or specifty the apiKey option.'
      )
    }

    return client.chat.completions.create(body)
  }
}
