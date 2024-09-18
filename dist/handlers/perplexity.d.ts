import { PerplexityModel, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare const PERPLEXITY_PREFIX = "perplexity/";
export declare class PerplexityHandler extends BaseHandler<PerplexityModel> {
    create(body: ProviderCompletionParams<'perplexity'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
