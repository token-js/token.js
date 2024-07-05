import { AnthropicHandler } from "./anthropic";
import { GeminiHandler } from "./gemini";
import { MISTRAL_PREFIX, MistralHandler } from "./mistral";
import { OpenAIHandler } from "./openai";
import { BaseHandler, ConfigOptions, InputError } from "./types";
import chalk from 'chalk'
import { CohereHandler } from "./cohere";
import { BedrockHandler } from "./bedrock";
import { GROQ_PREFIX, GroqHandler } from "./groq";

export const Handlers: Record<string, (opts: ConfigOptions) => any> = {
  'gpt-': (opts: ConfigOptions) => new OpenAIHandler(opts),
  'claude-': (opts: ConfigOptions) => new AnthropicHandler(opts),
  'gemini-': (opts: ConfigOptions) => new GeminiHandler(opts),
  'command-': (opts: ConfigOptions) => new CohereHandler(opts),
  'bedrock/': (opts: ConfigOptions) => new BedrockHandler(opts),
  [MISTRAL_PREFIX]: (opts: ConfigOptions) => new MistralHandler(opts),
  [GROQ_PREFIX]: (opts: ConfigOptions) => new GroqHandler(opts),
};

export const getHandler = (modelName: string, opts: ConfigOptions): BaseHandler => {
  for (const handlerKey in Handlers) {
    if (modelName.startsWith(handlerKey)) {
      return Handlers[handlerKey](opts);
    }
  }

  throw new Error(`Could not find provider for model. Are you sure the model name is correct and the provider is supported?`);
};

export const getTimestamp = () => {
  return Math.floor(new Date().getTime() / 1000)
}

export const consoleWarn = (message: string): void => {
  console.warn(chalk.yellow.bold(`Warning: ${message}\n`));
}

export const assertNIsOne = (n: number | null | undefined, provider: string): void => {
  if (typeof n === 'number' && n > 1) {
    throw new InputError(`${provider} does not support setting 'n' greater than 1.`)
  }
}
