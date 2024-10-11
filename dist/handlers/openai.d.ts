import { OpenAIModel, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare class OpenAIHandler extends BaseHandler<OpenAIModel> {
    create(body: ProviderCompletionParams<'openai'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
