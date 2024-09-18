import { LLMChatModel, LLMProvider } from '../chat/index.js';
import { ConfigOptions } from '../userTypes/index.js';
import { BaseHandler } from './base.js';
import { MIMEType } from './types.js';
export declare const Handlers: Record<string, (opts: ConfigOptions) => any>;
export declare const getHandler: (provider: LLMProvider, opts: ConfigOptions) => BaseHandler<any>;
export declare const getTimestamp: () => number;
export declare const fetchImageAsBase64: (url: string) => Promise<string>;
export declare const getMimeType: (url: string) => string;
export declare const fetchThenParseImage: (urlOrBase64Image: string) => Promise<{
    content: string;
    mimeType: MIMEType;
}>;
export declare const isSupportedMIMEType: (value: string) => value is MIMEType;
export declare const parseImage: (image: string) => {
    content: string;
    mimeType: MIMEType;
};
export declare const consoleWarn: (message: string) => void;
export declare const normalizeTemperature: (temperature: number, provider: LLMProvider, model: LLMChatModel) => number;
export declare const isEmptyObject: (variable: any) => boolean;
export declare const isObject: (variable: any) => boolean;
