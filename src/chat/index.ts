import { APIPromise } from 'openai/core.mjs';
import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions.mjs';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources/index.mjs';
import { Stream } from 'openai/streaming.mjs';
import { getHandler } from '../handlers/utils';
import { ConfigOptions, LLMChatModel } from '../handlers/types';

// This is a best guess at the options to include, we can revise as needed
type CompletionBase = Pick<ChatCompletionCreateParamsBase, 
  'messages' | 
  'temperature' | 
  'top_p' | 
  'stop' | 
  'presence_penalty' | 
  'n' | 
  'max_tokens'
> & {
  model: LLMChatModel;
}

type CompletionStreaming = CompletionBase & {
  stream: true;
}

type CompletionNonStreaming = CompletionBase & {
  stream?: false | null;
}

export type CompletionParams = CompletionStreaming | CompletionNonStreaming;

export class LLMCompletions {
  private opts: ConfigOptions;

  constructor (opts: ConfigOptions) {
    this.opts = opts;
  }

  create(
    body: CompletionNonStreaming,
  ): APIPromise<ChatCompletion>;
  create(
    body: CompletionStreaming,
  ): APIPromise<Stream<ChatCompletionChunk>>;
  create(
    body: CompletionBase,
  ): APIPromise<Stream<ChatCompletionChunk> | ChatCompletion>;
  create(
    body: CompletionParams,
  ): APIPromise<ChatCompletion | Stream<ChatCompletionChunk>> {
    const handler = getHandler(body.model, this.opts);
    return handler.create(body);
  }
}

export class LLMChat {
  completions: LLMCompletions;

  constructor(opts: ConfigOptions) {
    this.completions = new LLMCompletions(opts);
  }
}