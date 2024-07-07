import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions.mjs';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources/index.mjs';
import { Stream } from 'openai/streaming.mjs';
import { getHandler } from '../handlers/utils';
import { CompletionResponse, ConfigOptions, LLMChatModel, StreamCompletionResponse } from '../handlers/types';

type CompletionBase = Pick<ChatCompletionCreateParamsBase, 
  'messages' | 
  'temperature' | 
  'top_p' | 
  'stop' | 
  'n' | 
  'max_tokens' |
  'response_format'
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
  ): Promise<CompletionResponse>;
  create(
    body: CompletionStreaming,
  ): Promise<StreamCompletionResponse>;
  create(
    body: CompletionBase,
  ): Promise<CompletionResponse | StreamCompletionResponse>;
  create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse> {
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