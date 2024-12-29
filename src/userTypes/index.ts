/**
 * These types are explicitly intended to be imported by the user. We keep them separate for clarity
 * and so that they can be easily imported and used alongside the primary LLM class.
 */
import { ClientOptions } from 'openai'
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionTool as OpenAIChatCompletionTool,
  ChatCompletionMessageParam as OpenAICompletionMessageParam,
} from 'openai/resources/index'

export type ConfigOptions = Pick<ClientOptions, 'apiKey' | 'baseURL'> & {
  /**
   * When set to true, skips validation of model names. This is useful when using models that are not
   * in the predefined list, such as fine-tuned models or models from providers that frequently add new ones.
   *
   * @example
   * // Initialize with model check bypassed
   * const tokenjs = new TokenJS({
   *   byPassModelCheck: true
   * })
   *
   * // Now you can use any model name
   * await tokenjs.chat.completions.create({
   *   provider: 'bedrock',
   *   model: 'us.anthropic.claude-3-sonnet', // Would normally throw an error if unlisted
   *   messages: [
   *     { role: 'user', content: 'Hello!' }
   *   ]
   * })
   */
  byPassModelCheck?: boolean,
  bedrock?: {
    region?: string
    accessKeyId?: string
    secretAccessKey?: string
  }
}

export type ChatCompletionChoice = Omit<
  ChatCompletion.Choice,
  'finish_reason'
> & {
  finish_reason: ChatCompletion.Choice['finish_reason'] | 'unknown'
}

export type ChatCompletionChunkChoice = Omit<
  ChatCompletionChunk.Choice,
  'finish_reason'
> & {
  finish_reason: ChatCompletionChunk.Choice['finish_reason'] | 'unknown'
}

type CompletionResponseFields = 'created' | 'model' | 'usage' | 'object'
export type CompletionResponse = Pick<
  ChatCompletion,
  CompletionResponseFields
> & {
  id: string | null
  choices: Array<ChatCompletionChoice>
}
export type CompletionResponseChunk = Pick<
  ChatCompletionChunk,
  CompletionResponseFields
> & {
  id: string | null
  choices: Array<ChatCompletionChunkChoice>
}
export type StreamCompletionResponse = AsyncIterable<CompletionResponseChunk>
export type ChatCompletionMessageParam = OpenAICompletionMessageParam
export type ChatCompletionTool = OpenAIChatCompletionTool
