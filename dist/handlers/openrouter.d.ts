import { OpenRouterModel, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare class OpenRouterHandler extends BaseHandler<OpenRouterModel> {
    validateInputs(body: ProviderCompletionParams<'openrouter'>): void;
    create(body: ProviderCompletionParams<'openrouter'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
