import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';
import { models } from '../models.js';
import { CompletionResponse, ConfigOptions, StreamCompletionResponse } from '../userTypes/index.js';
export type OpenAIModel = (typeof models.openai.models)[number];
export type AI21Model = (typeof models.ai21.models)[number];
export type AnthropicModel = (typeof models.anthropic.models)[number];
export type GeminiModel = (typeof models.gemini.models)[number];
export type CohereModel = (typeof models.cohere.models)[number];
export type BedrockModel = (typeof models.bedrock.models)[number];
export type MistralModel = (typeof models.mistral.models)[number];
export type PerplexityModel = (typeof models.perplexity.models)[number];
export type GroqModel = (typeof models.groq.models)[number];
export type OpenRouterModel = string;
export type LLMChatModel = OpenAIModel | AI21Model | AnthropicModel | GeminiModel | CohereModel | BedrockModel | MistralModel | PerplexityModel | GroqModel | OpenRouterModel;
export type LLMProvider = keyof typeof models;
type ProviderModelMap = {
    openai: OpenAIModel;
    ai21: AI21Model;
    anthropic: AnthropicModel;
    gemini: GeminiModel;
    cohere: CohereModel;
    bedrock: BedrockModel;
    mistral: MistralModel;
    perplexity: PerplexityModel;
    groq: GroqModel;
    openrouter: OpenRouterModel;
};
type CompletionBase<P extends LLMProvider> = Pick<ChatCompletionCreateParamsBase, 'temperature' | 'top_p' | 'stop' | 'n' | 'messages' | 'max_tokens' | 'response_format' | 'tools' | 'tool_choice'> & {
    provider: P;
    model: ProviderModelMap[P];
};
export type CompletionStreaming<P extends LLMProvider> = CompletionBase<P> & {
    stream: true;
};
export type CompletionNonStreaming<P extends LLMProvider> = CompletionBase<P> & {
    stream?: false | null;
};
export type ProviderCompletionParams<P extends LLMProvider> = CompletionStreaming<P> | CompletionNonStreaming<P>;
export type CompletionParams = {
    [P in LLMProvider]: CompletionStreaming<P> | CompletionNonStreaming<P>;
}[LLMProvider];
export declare class LLMCompletions {
    private opts;
    constructor(opts: ConfigOptions);
    create<P extends LLMProvider>(body: CompletionNonStreaming<P>): Promise<CompletionResponse>;
    create<P extends LLMProvider>(body: CompletionStreaming<P>): Promise<StreamCompletionResponse>;
    create<P extends LLMProvider>(body: CompletionBase<P>): Promise<CompletionResponse | StreamCompletionResponse>;
}
export declare class LLMChat {
    completions: LLMCompletions;
    constructor(opts: ConfigOptions);
}
export {};
