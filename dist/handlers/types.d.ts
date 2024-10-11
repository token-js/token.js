export type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';
export type MIMEType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
export declare class InputError extends Error {
    constructor(message: string);
}
export declare class InvariantError extends Error {
    constructor(message: string);
}
