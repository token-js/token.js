import { ClientOptions } from "openai";
import { ChatCompletionChunk, ChatModel } from "openai/resources/index.mjs";
import { CompletionParams } from "../chat";
import { ChatCompletion } from "openai/src/resources/index.js";
import { models } from "../models";

export type OpenAIModel = (typeof models.openai.models)[number];
export type AI21Model = (typeof models.ai21.models)[number];
export type AnthropicModel = (typeof models.anthropic.models)[number];
export type GeminiModel = (typeof models.gemini.models)[number];
export type CohereModel = (typeof models.cohere.models)[number];
export type BedrockModel =(typeof models.bedrock.models)[number];
export type MistralModel = (typeof models.mistral.models)[number];
export type PerplexityModel = (typeof models.perplexity.models)[number];
export type GroqModel = (typeof models.groq.models)[number];

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | 'function'

export type LLMChatModel = OpenAIModel
| CohereModel
| AnthropicModel
| GeminiModel
| MistralModel
| GroqModel
| AI21Model
| PerplexityModel
| BedrockModel

export type ConfigOptions = Pick<ClientOptions, 'apiKey' | 'baseURL'> & {
  bedrock?: {
    region?: string
    accessKeyId?: string
    secretAccessKey?: string
  }
}

export type ChatCompletionChoice = Omit<ChatCompletion.Choice, 'finish_reason'> & {
  finish_reason: ChatCompletion.Choice['finish_reason'] | 'unknown'
}

type ChatCompletionChunkChoice = Omit<ChatCompletionChunk.Choice, 'finish_reason'> & {
  finish_reason: ChatCompletionChunk.Choice['finish_reason'] | 'unknown'
}

export type MIMEType = "image/jpeg" | "image/png" | "image/gif" | "image/webp"

export type CompletionResponseFields = 'created' | 'model' | 'usage' | 'object'
export type CompletionResponse = Pick<ChatCompletion, CompletionResponseFields> & {
  id: string | null
  choices: Array<ChatCompletionChoice>
}
export type CompletionResponseChunk = Pick<ChatCompletionChunk, CompletionResponseFields>  & {
  id: string | null
  choices: Array<ChatCompletionChunkChoice>
}
export type StreamCompletionResponse = AsyncIterable<CompletionResponseChunk>

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvariantError extends Error {
  constructor(message: string) {
    super(
      `${message}\n` +
      `Should never happen. Please report this error to the developers.`
    )
    this.name = 'InvariantError'
    Error.captureStackTrace(this, this.constructor);
  }
}

