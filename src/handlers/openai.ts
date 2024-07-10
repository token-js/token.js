import OpenAI from "openai";
import { Stream } from "openai/streaming.mjs";
import { CompletionResponse, StreamCompletionResponse } from "./types";
import { CompletionParams, OpenAIModel, ProviderCompletionParams } from "../chat";
import { BaseHandler } from "./base";
import { ChatCompletionCreateParams } from "openai/resources/index.mjs";

async function* streamOpenAI(
  response: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
): StreamCompletionResponse {
  for await (const chunk of response) {
    yield chunk
  }
}

// To support a new provider, we just create a handler for them extending the BaseHandler class and implement the create method.
// Then we update the Handlers object in src/handlers/utils.ts to include the new handler.
export class OpenAIHandler extends BaseHandler<OpenAIModel> {
  async create(
    body: ProviderCompletionParams<'openai'>,
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    this.validateInputs(body)

    // Uses the OPENAI_API_KEY environment variable, if the apiKey is not provided.
    // This makes the UX better for switching between providers because you can just
    // define all the environment variables and then change the model field without doing anything else.
    const apiKey = this.opts.apiKey ?? process.env.OPENAI_API_KEY;
    const openai = new OpenAI({
      ...this.opts,
      apiKey,
    });

    // We have to delete the provider field because it's not a valid parameter for the OpenAI API.
    const params: any = body
    delete params.provider

    if (body.stream) {
      const stream = await openai.chat.completions.create(body)
      return streamOpenAI(stream);
    } else {
      return openai.chat.completions.create(body);
    }
  }
}