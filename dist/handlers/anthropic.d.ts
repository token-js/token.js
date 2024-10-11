import { Message, MessageCreateParamsNonStreaming, MessageStream } from '@anthropic-ai/sdk/resources/messages';
import { AnthropicModel, CompletionParams, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare const createCompletionResponseNonStreaming: (response: Message, created: number, toolChoice: CompletionParams["tool_choice"]) => CompletionResponse;
export declare function createCompletionResponseStreaming(response: MessageStream, created: number): StreamCompletionResponse;
export declare const convertToolParams: (toolChoice: CompletionParams["tool_choice"], tools: CompletionParams["tools"]) => {
    toolChoice: MessageCreateParamsNonStreaming["tool_choice"];
    tools: MessageCreateParamsNonStreaming["tools"];
};
export declare const getDefaultMaxTokens: (model: string) => number;
export declare const convertMessages: (messages: CompletionParams["messages"]) => Promise<{
    messages: MessageCreateParamsNonStreaming["messages"];
    systemMessage: string | undefined;
}>;
export declare const convertStopSequences: (stop?: CompletionParams["stop"]) => Array<string> | undefined;
export declare class AnthropicHandler extends BaseHandler<AnthropicModel> {
    validateInputs(body: ProviderCompletionParams<'anthropic'>): void;
    create(body: ProviderCompletionParams<'anthropic'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
