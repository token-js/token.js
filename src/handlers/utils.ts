import { ChatCompletionMessageParam, ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { AnthropicHandler } from "./anthropic";
import { GeminiHandler } from "./gemini";
import { OpenAIHandler } from "./openai";
import { BaseHandler, ConfigOptions } from "./types";
import chalk from 'chalk'
import { CohereHandler } from "./cohere";

export const Handlers: Record<string, (opts: ConfigOptions) => any> = {
  'gpt-': (opts: ConfigOptions) => new OpenAIHandler(opts),
  'claude-': (opts: ConfigOptions) => new AnthropicHandler(opts),
  'gemini-': (opts: ConfigOptions) => new GeminiHandler(opts),
  'command-': (opts: ConfigOptions) => new CohereHandler(opts),
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
