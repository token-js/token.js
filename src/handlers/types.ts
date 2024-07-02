import { ClientOptions } from "openai";
import { ChatCompletionChunk, ChatModel } from "openai/resources/index.mjs";
import { CompletionParams } from "../chat";
import { ChatCompletion } from "openai/src/resources/index.js";
import { APIPromise } from "openai/core.mjs";
import { Stream } from "openai/streaming.mjs";

// We can extend this with additional model names from other providers
export type LLMChatModel = ChatModel

// We can pick addtional options if we want to extend the configuration
export type ConfigOptions = Pick<ClientOptions, 'apiKey'>;

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
  ): APIPromise<ChatCompletion | Stream<ChatCompletionChunk>>;
}