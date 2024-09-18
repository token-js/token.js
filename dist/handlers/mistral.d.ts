import { ChatCompletionResponseChoice, ChatRequest, Message, ToolCalls } from '@mistralai/mistralai';
import { ChatCompletionChunk, ChatCompletionMessage, ChatCompletionMessageParam, ChatCompletionMessageToolCall } from 'openai/resources/index';
import { CompletionParams, MistralModel, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare const findLinkedToolCallName: (messages: ChatCompletionMessage[], toolCallId: string) => string;
export declare const convertMessages: (messages: (ChatCompletionMessageParam | ChatCompletionMessage)[]) => Array<Message | ChatCompletionResponseChoice["message"]>;
export declare const convertTools: (tools: CompletionParams["tools"], specificFunctionName?: string) => ChatRequest["tools"];
export declare const convertToolConfig: (toolChoice: CompletionParams["tool_choice"], tools: CompletionParams["tools"]) => {
    toolChoice: ChatRequest["toolChoice"];
    tools: ChatRequest["tools"];
};
export declare const convertToolCalls: (toolResponse: ToolCalls[] | null | undefined) => ChatCompletionMessageToolCall[] | undefined;
export declare const convertStreamToolCalls: (toolResponse: ToolCalls[] | null | undefined) => Array<ChatCompletionChunk.Choice.Delta.ToolCall> | undefined;
export declare class MistralHandler extends BaseHandler<MistralModel> {
    create(body: ProviderCompletionParams<'mistral'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
