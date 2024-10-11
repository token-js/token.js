import { GroqModel, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare class GroqHandler extends BaseHandler<GroqModel> {
    validateInputs(body: ProviderCompletionParams<'groq'>): void;
    create(body: ProviderCompletionParams<'groq'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
