import { ClientOptions } from 'openai';
import { ChatCompletion, ChatCompletionChunk, ChatCompletionTool as OpenAIChatCompletionTool, ChatCompletionMessageParam as OpenAICompletionMessageParam } from 'openai/resources/index';
export type ConfigOptions = Pick<ClientOptions, 'apiKey' | 'baseURL'> & {
    bedrock?: {
        region?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
    };
};
export type ChatCompletionChoice = Omit<ChatCompletion.Choice, 'finish_reason'> & {
    finish_reason: ChatCompletion.Choice['finish_reason'] | 'unknown';
};
export type ChatCompletionChunkChoice = Omit<ChatCompletionChunk.Choice, 'finish_reason'> & {
    finish_reason: ChatCompletionChunk.Choice['finish_reason'] | 'unknown';
};
type CompletionResponseFields = 'created' | 'model' | 'usage' | 'object';
export type CompletionResponse = Pick<ChatCompletion, CompletionResponseFields> & {
    id: string | null;
    choices: Array<ChatCompletionChoice>;
};
export type CompletionResponseChunk = Pick<ChatCompletionChunk, CompletionResponseFields> & {
    id: string | null;
    choices: Array<ChatCompletionChunkChoice>;
};
export type StreamCompletionResponse = AsyncIterable<CompletionResponseChunk>;
export type ChatCompletionMessageParam = OpenAICompletionMessageParam;
export type ChatCompletionTool = OpenAIChatCompletionTool;
export {};
