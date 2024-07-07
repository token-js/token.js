import Groq from "groq-sdk";
import { CompletionResponse, GroqModel, InputError, StreamCompletionResponse } from "./types";
import { CompletionParams } from "../chat";
import { assertNIsOne, consoleWarn } from "./utils";
import { ModelPrefix } from "../constants";
import { BaseHandler } from "./base";
import { ChatCompletionCreateParamsBase } from "groq-sdk/resources/chat/completions.mjs";

// Groq is very compatible with OpenAI's API, so we could likely reuse the OpenAI SDK for this handler
// to reducee the bundle size.
export class GroqHandler extends BaseHandler<GroqModel> {

  validateInputs(body: CompletionParams): void {
    super.validateInputs(body)

    if (body.response_format?.type === 'json_object') {
      if (body.stream) {
        throw new InputError(`Groq does not support streaming when the 'response_format' is 'json_object'.`)
      }

      if (body.stop !== null && body.stop !== undefined) {
        throw new InputError(`Groq does not support the 'stop' parameter when the 'response_format' is 'json_object'.`)
      }
    }
  }

  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
    this.validateInputs(body)

    const apiKey = this.opts.apiKey ?? process.env.GROQ_API_KEY;
    const baseURL = this.opts.baseURL
    const client = new Groq({
      apiKey,
      baseURL,
    })

    if (apiKey === undefined) {
      throw new InputError("API key is required for Groq, define GROQ_API_KEY in your environment or specifty the apiKey option.");
    }

    assertNIsOne(body.n, 'Groq')
    const model = body.model.replace(ModelPrefix.Groq, '')

    return client.chat.completions.create({
      stream: body.stream,
      messages: body.messages as Groq.Chat.ChatCompletionMessageParam[],
      model,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      top_p: body.top_p,
      stop: body.stop,
      n: body.n,
      response_format: body.response_format
    })
  }
}
