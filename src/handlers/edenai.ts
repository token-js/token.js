import OpenAI from 'openai'

import { EdenAIModel, ProviderCompletionParams } from '../chat/index.js'
import {
  CompletionResponse,
  StreamCompletionResponse,
} from '../userTypes/index.js'
import { BaseHandler } from './base.js'
import { InputError } from './types.js'

// Eden AI is an OpenAI-compatible LLM gateway, so we reuse the OpenAI SDK for this handler.
export class EdenAIHandler extends BaseHandler<EdenAIModel> {
  validateInputs(body: ProviderCompletionParams<'edenai'>): void {
    super.validateInputs(body)
  }

  async create(
    body: ProviderCompletionParams<'edenai'>
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    this.validateInputs(body)

    const apiKey = this.opts.apiKey ?? process.env.EDENAI_API_KEY
    const client = new OpenAI({
      apiKey,
      baseURL: 'https://api.edenai.run/v3',
    })

    if (apiKey === undefined) {
      throw new InputError(
        'API key is required for Eden AI, define EDENAI_API_KEY in your environment or specify the apiKey option.'
      )
    }

    return client.chat.completions.create(body)
  }
}
