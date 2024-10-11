import { AI21Model, CompletionParams, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare class AI21Handler extends BaseHandler<AI21Model> {
    validateInputs(body: CompletionParams): void;
    create(body: ProviderCompletionParams<'ai21'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
