import OpenAI from "openai";
import { Stream } from "openai/streaming.mjs";
import { BaseHandler, CompletionResponse, InputError, StreamCompletionResponse } from "./types";
import { CompletionParams } from "../chat";

export const PERPLEXITY_PREFIX = "perplexity/";

async function* streamPerplexity(
  response: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
): StreamCompletionResponse {
  for await (const chunk of response) {
    yield chunk
  }
}

export class PerplexityHandler extends BaseHandler {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    const apiKey = this.opts.apiKey ?? process.env.PERPLEXITY_API_KEY;

    if (apiKey === undefined) {
      throw new InputError("API key is required for Perplexity, define PERPLEXITY_API_KEY in your environment or specifty the apiKey option.");
    }

    if (typeof body.n === 'number' && body.n > 1) {
      throw new InputError(`Perplexity does not support setting 'n' greater than 1.`)
    }

    const openai = new OpenAI({
      ...this.opts,
      baseURL: "https://api.perplexity.ai",
      apiKey,
    });
    
    const model = body.model.replace(PERPLEXITY_PREFIX, '');

    const options = {
      ...body,
      model
    }

    if (options.stream) {
      const stream = await openai.chat.completions.create(options)
      return streamPerplexity(stream);
    } else {
      return openai.chat.completions.create(options);
    }
  }
}