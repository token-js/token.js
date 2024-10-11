import { Content, EnhancedGenerateContentResponse, FinishReason, GenerateContentCandidate, GenerateContentResult, Part, Tool, ToolConfig, UsageMetadata } from '@google/generative-ai';
import OpenAI from 'openai';
import { ChatCompletionChunk, ChatCompletionContentPart } from 'openai/resources/index';
import { ChatCompletionMessageToolCall } from 'openai/src/resources/index.js';
import { GeminiModel, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
type EnhancedResponseWithOptionalContent = Omit<EnhancedGenerateContentResponse, 'candidates'> & {
    candidates?: GenerateContentCandidateWithOptionalContent[];
};
type GenerateContentCandidateWithOptionalContent = Omit<GenerateContentCandidate, 'content'> & {
    content?: Content;
};
type GenerateContentResultWithOptionalContent = Omit<GenerateContentResult, 'response'> & {
    response: EnhancedResponseWithOptionalContent;
};
export declare const convertContentsToParts: (contents: Array<ChatCompletionContentPart> | string | null | undefined, systemPrefix: string) => Promise<Part[]>;
export declare const convertRole: (role: "function" | "system" | "user" | "assistant" | "tool") => "model" | "user";
export declare const convertAssistantMessage: (message: OpenAI.Chat.Completions.ChatCompletionMessage) => Content;
export declare const convertMessageToContent: (message: OpenAI.Chat.Completions.ChatCompletionMessageParam, includeSystemPrefix: boolean) => Promise<Content>;
export declare const convertMessagesToContents: (messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) => Promise<{
    contents: Content[];
    systemInstruction: Content | undefined;
}>;
export declare const convertFinishReason: (finishReason: FinishReason, parts: Part[] | undefined) => "stop" | "length" | "tool_calls" | "content_filter" | "function_call";
export declare const convertToolCalls: (candidate: GenerateContentCandidateWithOptionalContent) => Array<ChatCompletionMessageToolCall> | undefined;
export declare const convertStreamToolCalls: (candidate: GenerateContentCandidateWithOptionalContent) => Array<ChatCompletionChunk.Choice.Delta.ToolCall> | undefined;
export declare const convertResponseMessage: (candidate: GenerateContentCandidateWithOptionalContent) => CompletionResponse["choices"][number]["message"];
export declare const convertUsageData: (usageMetadata: UsageMetadata) => CompletionResponse["usage"];
export declare const convertToolConfig: (toolChoice: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption | undefined, tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined) => ToolConfig;
export declare const convertTools: (tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined) => Tool[] | undefined;
export declare const convertResponse: (result: GenerateContentResultWithOptionalContent, model: string, timestamp: number) => Promise<CompletionResponse>;
export declare class GeminiHandler extends BaseHandler<GeminiModel> {
    create(body: ProviderCompletionParams<'gemini'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
export {};
