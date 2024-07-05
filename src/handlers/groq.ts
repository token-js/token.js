import Groq from "groq-sdk";
import { BaseHandler, CompletionResponse, InputError, StreamCompletionResponse } from "./types";
import { CompletionParams } from "../chat";
import { assertNIsOne, consoleWarn } from "./utils";

export const GROQ_PREFIX = 'groq/'

// Groq is very compatible with OpenAI's API, so we could likely reuse the OpenAI SDK for this handler
// to reducee the bundle size.
export class GroqHandler extends BaseHandler {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
    const apiKey = this.opts.apiKey ?? process.env.GROQ_API_KEY;
    const baseURL = this.opts.baseURL
    const client = new Groq({
      apiKey,
      baseURL,
    })

    if (this.opts.baseURL) {
      consoleWarn(`The 'baseUrl' will be ignored by Gemini because it does not support this field.`)
    }

    if (apiKey === undefined) {
      throw new InputError("API key is required for Groq, define GROQ_API_KEY in your environment or specifty the apiKey option.");
    }

    assertNIsOne(body.n, 'Groq')
    const model = body.model.replace(GROQ_PREFIX, '')

    return client.chat.completions.create({
      stream: body.stream,
      messages: body.messages as Groq.Chat.ChatCompletionMessageParam[],
      model,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      top_p: body.top_p,
      stop: body.stop,
      n: body.n,
    })
  }
}