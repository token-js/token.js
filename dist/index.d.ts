import { LLMChat } from './chat/index.js';
import { ConfigOptions } from './userTypes/index.js';
export * from './userTypes/index.js';
type TokenJSInterface = {
    chat: LLMChat;
};
export declare class TokenJS implements TokenJSInterface {
    private opts;
    chat: LLMChat;
    constructor({ ...opts }?: ConfigOptions);
}
