import { ClientOptions } from "openai";
import { ChatCompletionChunk, ChatModel } from "openai/resources/index.mjs";
import { CompletionParams } from "../chat";
import { ChatCompletion } from "openai/src/resources/index.js";
import { APIPromise } from "openai/core.mjs";
import { Stream } from "openai/streaming.mjs";

export type GeminiModels = 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-1.0-pro'

// We can extend this with additional model names from other providers
export type LLMChatModel = ChatModel | GeminiModels

// We can pick addtional options if we want to extend the configuration
export type ConfigOptions = Pick<ClientOptions, 'apiKey' | 'baseURL'>;

export type CompletionResponseFields = 'choices' | 'created' | 'model' | 'usage' | 'object'
export type CompletionResponse = Pick<ChatCompletion, CompletionResponseFields> & {
  id: string | null
}
export type CompletionResponseChunk = Pick<ChatCompletionChunk, CompletionResponseFields>  & {
  id: string | null
}
export type StreamCompletionResponse = AsyncIterable<CompletionResponseChunk>


// This is the base handler type used to support different providers. We can extend this to support
// additional features as needed.
// To do so we:
// - 1. Add the required handler functions for the feature to this class (the specific function(s) need to be implemented for the feature to work)
// - 2. Add a new client object to support the feature. This should be similar to the LLMChat class in ./src/chat/index.ts, and should be added to the LLM class in ./src/index.ts.
// - 3. Implement the new handlers for the feature in each of the provider handler classes
export abstract class BaseHandler {
  opts: ConfigOptions;

  constructor(opts: ConfigOptions) {
    this.opts = opts;
  }

  abstract create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>;
}

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}