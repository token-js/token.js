import { ChatRequest, Message, Tool } from 'cohere-ai/api';
import { ChatCompletionTool } from 'openai/src/resources/index.js';
import { CohereModel, CompletionParams, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare const toCohereTool: (tool: ChatCompletionTool) => Tool;
export declare const convertMessages: (unclonedMessages: CompletionParams["messages"]) => {
    messages: Array<Message>;
    lastUserMessage: string;
    toolResults: ChatRequest["toolResults"];
};
export declare const convertTools: (tools: CompletionParams["tools"], toolChoice: CompletionParams["tool_choice"]) => ChatRequest["tools"];
export declare class CohereHandler extends BaseHandler<CohereModel> {
    create(body: ProviderCompletionParams<'cohere'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
