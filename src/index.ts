import { LLMChat, LLMChatModel, LLMProvider } from './chat/index.js'
import { ConfigOptions } from './userTypes/index.js'
export * from './userTypes/index.js'

// Extract the public interface from OpenAI, including both properties and methods
// type PublicInterface<T> = {
//   [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : T[K]
// }

// Pick the properties we want to expose from OpenAI and use them to construct our own client interface
// We omit the _client property from the completions object because it is not needed
// type Completions = Omit<
//   Pick<PublicInterface<OpenAI>['chat'], 'completions'>['completions'],
//   '_client'
// >

// type Chat = {
//   completions: Completions
// }

type TokenJSInterface = {
  chat: LLMChat
}

export class TokenJS implements TokenJSInterface {
  private opts: ConfigOptions
  chat: LLMChat

  constructor({ ...opts }: ConfigOptions = {}) {
    this.opts = opts

    // We pass a reference to the LLM instance to the LLMChat instance so that the completions object can access the opts
    this.chat = new LLMChat(opts)
  }
}

// Export all provider and model types
export type {
  AI21Model,
  AnthropicModel,
  BedrockModel,
  CohereModel,
  GeminiModel,
  GroqModel,
  LLMProvider,
  MistralModel,
  OpenAICompatibleModel,
  OpenAIModel,
  OpenRouterModel,
  PerplexityModel,
  ProviderModelMap,
} from './chat/index.js'

// Export a combined type of all models for convenience
export type SupportedModel = LLMChatModel
export type SupportedProvider = LLMProvider

// Export completion request types
export type {
  CompletionBase,
  CompletionNonStreaming,
  CompletionParams,
  CompletionStreaming,
  ProviderCompletionParams,
} from './chat/index.js'

// Export completion response types
export type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  CompletionResponse,
  CompletionResponseChunk,
  StreamCompletionResponse,
} from './userTypes/index.js'

// Export configuration types
export type { ConfigOptions } from './userTypes/index.js'
