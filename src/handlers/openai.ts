import OpenAI from "openai";
import { Stream } from "openai/streaming.mjs";
import { BaseHandler, CompletionResponse, StreamCompletionResponse } from "./types";
import { CompletionParams } from "../chat";

async function* streamOpenAI(
  response: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
): StreamCompletionResponse {
  for await (const chunk of response) {
    yield chunk
  }
}

// To support a new provider, we just create a handler for them extending the BaseHandler class and implement the create method.
// Then we update the Handlers object in src/handlers/utils.ts to include the new handler.
export class OpenAIHandler extends BaseHandler {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    // Uses the OPENAI_API_KEY environment variable, if the apiKey is not provided.
    // This makes the UX better for switching between providers because you can just
    // define all the environment variables and then change the model field without doing anything else.
    const apiKey = this.opts.apiKey ?? process.env.OPENAI_API_KEY;
    const openai = new OpenAI({
      ...this.opts,
      apiKey,
    });
    
    if (body.stream) {
      const stream = await openai.chat.completions.create(body)
      return streamOpenAI(stream);
    } else {
      return openai.chat.completions.create(body);
    }
  }
}