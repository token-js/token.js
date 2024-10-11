export declare const TableDisplayNames: {
    models: string;
    supportsCompletion: string;
    supportsStreaming: string;
    supportsJSON: string;
    supportsImages: string;
    supportsToolCalls: string;
    supportsN: string;
};
export declare const models: {
    openai: {
        models: readonly ["o1-preview", "o1-mini", "gpt-4o", "gpt-4o-mini", "gpt-4o-2024-05-13", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-4-turbo-2024-04-09", "gpt-4-0125-preview", "gpt-4-turbo-preview", "gpt-4-1106-preview", "gpt-4-vision-preview", "gpt-4", "gpt-4-0314", "gpt-4-0613", "gpt-4-32k", "gpt-4-32k-0314", "gpt-4-32k-0613", "gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-3.5-turbo-0301", "gpt-3.5-turbo-0613", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0125", "gpt-3.5-turbo-16k-0613"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["o1-preview", "o1-mini", "gpt-4o", "gpt-4o-mini", "gpt-4o-2024-05-13", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-4-turbo-2024-04-09", "gpt-4-0125-preview", "gpt-4-turbo-preview", "gpt-4-1106-preview", "gpt-4-vision-preview", "gpt-4", "gpt-4-0314", "gpt-4-0613", "gpt-4-32k", "gpt-4-32k-0314", "gpt-4-32k-0613", "gpt-3.5-turbo", "gpt-3.5-turbo-16k", "gpt-3.5-turbo-0301", "gpt-3.5-turbo-0613", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0125", "gpt-3.5-turbo-16k-0613"];
        supportsJSON: readonly ["gpt-4o", "gpt-4o-mini", "gpt-4o-2024-05-13", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-4-turbo-2024-04-09", "gpt-4-0125-preview", "gpt-4-turbo-preview", "gpt-4-1106-preview", "gpt-4-vision-preview", "gpt-3.5-turbo", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0125"];
        supportsImages: readonly ["gpt-4o", "gpt-4o-mini", "gpt-4o-2024-05-13", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-4-turbo-2024-04-09", "gpt-4-0125-preview", "gpt-4-turbo-preview", "gpt-4-1106-preview", "gpt-4-vision-preview"];
        supportsToolCalls: readonly ["gpt-4o", "gpt-4o-mini", "gpt-4o-2024-05-13", "gpt-4o-2024-08-06", "gpt-4-turbo", "gpt-4-turbo-2024-04-09", "gpt-4-turbo-preview", "gpt-4-0125-preview", "gpt-4-1106-preview", "gpt-4", "gpt-4-0613", "gpt-3.5-turbo", "gpt-3.5-turbo-0125", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0613"];
        supportsN: boolean;
        generateDocs: boolean;
    };
    ai21: {
        models: readonly ["jamba-instruct"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["jamba-instruct"];
        supportsJSON: readonly [];
        supportsImages: readonly [];
        supportsToolCalls: readonly [];
        supportsN: boolean;
        generateDocs: boolean;
    };
    anthropic: {
        models: readonly ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307", "claude-2.1", "claude-2.0", "claude-instant-1.2"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307", "claude-2.1", "claude-2.0", "claude-instant-1.2"];
        supportsJSON: readonly [];
        supportsImages: readonly ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"];
        supportsToolCalls: readonly ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"];
        supportsN: boolean;
        generateDocs: boolean;
    };
    gemini: {
        models: readonly ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
        supportsJSON: readonly ["gemini-1.5-pro", "gemini-1.5-flash"];
        supportsImages: readonly ["gemini-1.5-pro", "gemini-1.5-flash"];
        supportsToolCalls: readonly ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];
        supportsN: boolean;
        generateDocs: boolean;
    };
    cohere: {
        models: readonly ["command-r-plus", "command-r", "command", "command-nightly", "command-light", "command-light-nightly"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["command-r-plus", "command-r", "command", "command-nightly", "command-light", "command-light-nightly"];
        supportsJSON: readonly [];
        supportsImages: readonly [];
        supportsToolCalls: readonly ["command-r-plus", "command-r", "command-nightly"];
        supportsN: boolean;
        generateDocs: boolean;
    };
    bedrock: {
        models: readonly ["amazon.titan-text-lite-v1", "amazon.titan-text-express-v1", "anthropic.claude-3-opus-20240229-v1:0", "anthropic.claude-3-5-sonnet-20240620-v1:0", "anthropic.claude-3-sonnet-20240229-v1:0", "anthropic.claude-3-haiku-20240307-v1:0", "anthropic.claude-v2:1", "anthropic.claude-v2", "anthropic.claude-instant-v1", "cohere.command-r-plus-v1:0", "cohere.command-r-v1:0", "cohere.command-text-v14", "cohere.command-light-text-v14", "meta.llama3-2-11b-instruct-v1:0", "meta.llama3-2-90b-instruct-v1:0", "meta.llama3-8b-instruct-v1:0", "meta.llama3-70b-instruct-v1:0", "meta.llama2-13b-chat-v1", "meta.llama2-70b-chat-v1", "mistral.mistral-7b-instruct-v0:2", "mistral.mixtral-8x7b-instruct-v0:1", "mistral.mistral-large-2402-v1:0"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["amazon.titan-text-lite-v1", "amazon.titan-text-express-v1", "anthropic.claude-3-opus-20240229-v1:0", "anthropic.claude-3-5-sonnet-20240620-v1:0", "anthropic.claude-3-sonnet-20240229-v1:0", "anthropic.claude-3-haiku-20240307-v1:0", "anthropic.claude-v2:1", "anthropic.claude-v2", "anthropic.claude-instant-v1", "cohere.command-r-plus-v1:0", "cohere.command-r-v1:0", "cohere.command-text-v14", "cohere.command-light-text-v14", "meta.llama3-2-11b-instruct-v1:0", "meta.llama3-2-90b-instruct-v1:0", "meta.llama3-8b-instruct-v1:0", "meta.llama3-70b-instruct-v1:0", "meta.llama2-13b-chat-v1", "meta.llama2-70b-chat-v1", "mistral.mistral-7b-instruct-v0:2", "mistral.mixtral-8x7b-instruct-v0:1", "mistral.mistral-large-2402-v1:0"];
        supportsJSON: never[];
        supportsImages: readonly ["anthropic.claude-3-5-sonnet-20240620-v1:0", "anthropic.claude-3-sonnet-20240229-v1:0", "anthropic.claude-3-opus-20240229-v1:0", "anthropic.claude-3-haiku-20240307-v1:0"];
        supportsToolCalls: readonly ["anthropic.claude-3-opus-20240229-v1:0", "anthropic.claude-3-5-sonnet-20240620-v1:0", "anthropic.claude-3-sonnet-20240229-v1:0", "anthropic.claude-3-haiku-20240307-v1:0", "cohere.command-r-plus-v1:0", "cohere.command-r-v1:0", "mistral.mistral-large-2402-v1:0"];
        supportsN: boolean;
        generateDocs: boolean;
    };
    mistral: {
        models: readonly ["open-mistral-7b", "mistral-tiny-2312", "open-mixtral-8x7b", "mistral-small-2312", "open-mixtral-8x22b", "open-mixtral-8x22b-2404", "mistral-small-latest", "mistral-small-2402", "mistral-medium-latest", "mistral-medium-2312", "mistral-large-latest", "mistral-large-2402", "codestral-latest", "codestral-2405", "codestral-mamba-2407"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["open-mistral-7b", "mistral-tiny-2312", "open-mixtral-8x7b", "mistral-small-2312", "open-mixtral-8x22b", "open-mixtral-8x22b-2404", "mistral-small-latest", "mistral-small-2402", "mistral-medium-latest", "mistral-medium-2312", "mistral-large-latest", "mistral-large-2402", "codestral-latest", "codestral-2405", "codestral-mamba-2407"];
        supportsJSON: readonly ["open-mistral-7b", "mistral-tiny-2312", "open-mixtral-8x22b", "open-mixtral-8x22b-2404", "mistral-large-latest", "mistral-large-2402", "codestral-latest", "codestral-2405", "codestral-mamba-2407"];
        supportsImages: readonly [];
        supportsToolCalls: readonly ["open-mixtral-8x22b", "open-mixtral-8x22b-2404", "mistral-small-latest", "mistral-small-2402", "mistral-large-latest", "mistral-large-2402", "codestral-mamba-2407"];
        supportsN: boolean;
        generateDocs: boolean;
    };
    groq: {
        models: readonly ["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768", "gemma-7b-it", "gemma2-9b-it"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768", "gemma-7b-it", "gemma2-9b-it"];
        supportsJSON: readonly ["llama3-70b-8192", "gemma-7b-it", "gemma2-9b-it"];
        supportsImages: readonly [];
        supportsToolCalls: readonly [];
        supportsN: boolean;
        generateDocs: boolean;
    };
    perplexity: {
        models: readonly ["llama-3-sonar-small-32k-chat", "llama-3-sonar-small-32k-online", "llama-3-sonar-large-32k-chat", "llama-3-sonar-large-32k-online", "llama-3-8b-instruct", "llama-3-70b-instruct", "mixtral-8x7b-instruct"];
        supportsCompletion: boolean;
        supportsStreaming: readonly ["llama-3-sonar-small-32k-chat", "llama-3-sonar-small-32k-online", "llama-3-sonar-large-32k-chat", "llama-3-sonar-large-32k-online", "llama-3-8b-instruct", "llama-3-70b-instruct", "mixtral-8x7b-instruct"];
        supportsJSON: readonly [];
        supportsImages: readonly [];
        supportsToolCalls: readonly [];
        supportsN: boolean;
        generateDocs: boolean;
    };
    openrouter: {
        models: boolean;
        supportsCompletion: boolean;
        supportsStreaming: boolean;
        supportsJSON: boolean;
        supportsImages: boolean;
        supportsToolCalls: boolean;
        supportsN: boolean;
        generateDocs: boolean;
    };
};
