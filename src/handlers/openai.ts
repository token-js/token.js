import OpenAI from "openai";
import { APIPromise } from "openai/core.mjs";
import { ChatCompletionChunk, ChatCompletionCreateParams } from "openai/resources/index.mjs";
import { ChatCompletion } from "openai/src/resources/index.js";
import { Stream } from "openai/streaming.mjs";
import { BaseHandler } from "./types";

// To support a new provider, we just create a handler for them extending the BaseHandler class and implement the create method.
// Then we update the Handlers object in src/handlers/utils.ts to include the new handler.
export class OpenAIHandler extends BaseHandler {
  create(
    body: ChatCompletionCreateParams,
  ): APIPromise<ChatCompletion | Stream<ChatCompletionChunk>> {
    const openai = new OpenAI(this.opts);
    return openai.chat.completions.create(body);
  }
}