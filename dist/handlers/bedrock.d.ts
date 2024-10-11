import { ConverseCommandInput, SystemContentBlock } from '@aws-sdk/client-bedrock-runtime';
import { BedrockModel, CompletionNonStreaming, CompletionParams, CompletionStreaming, ProviderCompletionParams } from '../chat/index.js';
import { CompletionResponse, StreamCompletionResponse } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
export declare const convertMessages: (messages: CompletionParams["messages"], model: BedrockModel) => Promise<{
    systemMessages: Array<SystemContentBlock> | undefined;
    messages: ConverseCommandInput["messages"];
}>;
export declare const convertToolParams: (toolChoice: CompletionParams["tool_choice"], tools: CompletionParams["tools"]) => ConverseCommandInput["toolConfig"];
export declare class BedrockHandler extends BaseHandler<BedrockModel> {
    validateInputs(body: CompletionStreaming<'bedrock'> | CompletionNonStreaming<'bedrock'>): void;
    create(body: ProviderCompletionParams<'bedrock'>): Promise<CompletionResponse | StreamCompletionResponse>;
}
