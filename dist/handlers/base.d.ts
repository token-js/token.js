import { CompletionParams, LLMChatModel } from '../chat/index.js';
import { CompletionResponse, ConfigOptions, StreamCompletionResponse } from '../userTypes/index.js';
export declare abstract class BaseHandler<T extends LLMChatModel> {
    opts: ConfigOptions;
    protected models: readonly T[] | boolean;
    protected supportsJSON: readonly T[] | boolean;
    protected supportsImages: readonly T[] | boolean;
    protected supportsToolCalls: readonly T[] | boolean;
    protected supportsN: readonly T[] | boolean;
    protected supportsStreamingMessages: readonly T[] | boolean;
    constructor(opts: ConfigOptions, models: readonly T[] | boolean, supportsJSON: readonly T[] | boolean, supportsImages: readonly T[] | boolean, supportsToolCalls: readonly T[] | boolean, suportsN: readonly T[] | boolean, supportsStreamingMessages: readonly T[] | boolean);
    abstract create(body: CompletionParams): Promise<CompletionResponse | StreamCompletionResponse>;
    protected validateInputs(body: CompletionParams): void;
    protected isSupportedFeature(featureSupport: readonly T[] | boolean, model: T): boolean;
    isSupportedModel(model: string): model is T;
    protected supportsJSONMode(model: T): boolean;
    protected supportsImageMessages(model: T): boolean;
    protected supportsNGreaterThanOne(model: T): boolean;
    protected supportsTools(model: T): boolean;
    protected supportsStreaming(model: T): boolean;
}
