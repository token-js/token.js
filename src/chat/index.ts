import { APIPromise } from 'openai/core.mjs';
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions.mjs';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources/index.mjs';
import { Stream } from 'openai/streaming.mjs';
import { getHandler } from '../handlers/utils';
import { ConfigOptions, GeminiModel, OpenAIModel } from '../handlers/types';
import { SafetySetting } from '@google/generative-ai';

// Define the base types
type CompletionBase = Pick<ChatCompletionCreateParamsBase, 
  'messages' | 
  'temperature' | 
  'top_p' | 
  'stop' | 
  'presence_penalty' | 
  'n' | 
  'max_tokens'
> & {
  model: OpenAIModel | GeminiModel;
}

type CompletionStreamingBase = CompletionBase & {
  stream: true;
}

type CompletionNonStreamingBase = CompletionBase & {
  stream?: false | null;
}

export type CompletionStreamingOpenAI = CompletionStreamingBase & {
  model: OpenAIModel;
  safety_settings?: never;
}

export type CompletionNonStreamingOpenAI = CompletionNonStreamingBase & {
  model: OpenAIModel;
  safety_settings?: never;
}

export type CompletionStreamingGemini = CompletionStreamingBase & {
  model: GeminiModel;
  safety_settings?: SafetySetting[];
}

export type CompletionNonStreamingGemini = CompletionNonStreamingBase & {
  model: GeminiModel;
  safety_settings?: SafetySetting[];
}

type CompletionNonStreaming = CompletionNonStreamingOpenAI | CompletionNonStreamingGemini;
type CompletionStreaming = CompletionStreamingOpenAI | CompletionStreamingGemini;
export type CompletionParamsOpenAI = CompletionStreamingOpenAI | CompletionNonStreamingOpenAI;
export type CompletionParamsGemini = CompletionStreamingGemini | CompletionNonStreamingGemini;
export type CompletionParams = CompletionParamsOpenAI | CompletionParamsGemini;

type ExtractModel<T> = T extends { model: infer M } ? M : never;

export class LLMCompletions {
  private opts: ConfigOptions;

  constructor(opts: ConfigOptions) {
    this.opts = opts;
  }

  create(
    body: CompletionNonStreaming,
  ): APIPromise<ChatCompletion>;
  create(
    body: CompletionStreaming,
  ): APIPromise<Stream<ChatCompletionChunk>>;
  create(
    body: CompletionParams,
  ): APIPromise<Stream<ChatCompletionChunk> | ChatCompletion>;

  create(
    body: CompletionNonStreaming,
  ): APIPromise<ChatCompletion>;
  create(
    body: CompletionStreaming,
  ): APIPromise<Stream<ChatCompletionChunk>>;
  create(
    body: CompletionParams,
  ): APIPromise<Stream<ChatCompletionChunk> | ChatCompletion>;

  create<T extends CompletionParams>(
    body: T & { model: ExtractModel<T> }
  ): T extends CompletionStreamingOpenAI | CompletionStreamingGemini
      ? APIPromise<Stream<ChatCompletionChunk>>
      : APIPromise<ChatCompletion> {
    const handler = getHandler(body.model, this.opts);
    return handler.create(body) as any;
  }
}

export class LLMChat {
  completions: LLMCompletions;

  constructor(opts: ConfigOptions) {
    this.completions = new LLMCompletions(opts);
  }
}