import { AnthropicHandler } from "./anthropic";
import { GeminiHandler } from "./gemini";
import { MISTRAL_PREFIX, MistralHandler } from "./mistral";
import { OpenAIHandler } from "./openai";
import { BaseHandler, ConfigOptions, InputError, MIMEType } from "./types";
import chalk from 'chalk'
import { CohereHandler } from "./cohere";
import { BedrockHandler } from "./bedrock";
import { GROQ_PREFIX, GroqHandler } from "./groq";
import axios from 'axios'
import { CompletionParams } from "../chat";
import { ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { AI21Handler } from "./ai21";
import { PERPLEXITY_PREFIX, PerplexityHandler } from "./perplexity";

export const Handlers: Record<string, (opts: ConfigOptions) => any> = {
  'gpt-': (opts: ConfigOptions) => new OpenAIHandler(opts),
  'claude-': (opts: ConfigOptions) => new AnthropicHandler(opts),
  'gemini-': (opts: ConfigOptions) => new GeminiHandler(opts),
  'command-': (opts: ConfigOptions) => new CohereHandler(opts),
  'bedrock/': (opts: ConfigOptions) => new BedrockHandler(opts),
  [MISTRAL_PREFIX]: (opts: ConfigOptions) => new MistralHandler(opts),
  [GROQ_PREFIX]: (opts: ConfigOptions) => new GroqHandler(opts),
  'jamba-': (opts: ConfigOptions) => new AI21Handler(opts),
  [PERPLEXITY_PREFIX]: (opts: ConfigOptions) => new PerplexityHandler(opts),
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

export const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
};

const fetchMIMEType = async (url: string): Promise<string | null> => {
  const response = await axios.head(url);
  return response.headers['content-type'] || null;
};

const isUrl = (input: string): boolean => {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

const isBase64Image = (input: string): boolean => /^data:image\/[a-zA-Z]+;base64,/.test(input);

export const fetchThenParseImage = async (
  urlOrBase64Image: string
): Promise<{ content: string, mimeType: MIMEType}> => {
  if (isUrl(urlOrBase64Image)) {
    const content = await fetchImageAsBase64(urlOrBase64Image)
    const mimeType = await fetchMIMEType(urlOrBase64Image)
    if (mimeType === null) {
      throw new Error(`Failed to get the mime type for the URL: ${urlOrBase64Image}`)
    }
    if (!isSupportedMIMEType(mimeType)) {
      throw new InputError(`Unsupported MIME type: ${mimeType}`)
    }

    return {
      content, mimeType
    }
  } else if (isBase64Image(urlOrBase64Image)) {
    return parseImage(urlOrBase64Image)
  } else {
    throw new InputError("Invalid image URL.")
  }
}

export const isSupportedMIMEType = (value: string): value is MIMEType => {
  return value === "image/jpeg" || value === "image/png" || value === "image/gif" || value === "image/webp";
}

export const parseImage = (image: string): { content: string, mimeType: MIMEType } => {
  const parts = image.split(";base64,")
  if (parts.length === 2) {
    const mimeType = parts[0].replace('data:', '').toLowerCase()
    if (!isSupportedMIMEType(mimeType)) {
      throw new InputError(`Unsupported MIME type: ${mimeType}`)
    }
    return {
      content: parts[1],
      mimeType
    }
  } else {
    throw new InputError("Invalid image URL.")
  }
}

export const consoleWarn = (message: string): void => {
  console.warn(chalk.yellow.bold(`Warning: ${message}\n`));
}

export const assertNIsOne = (n: number | null | undefined, provider: string): void => {
  if (typeof n === 'number' && n > 1) {
    throw new InputError(`${provider} does not support setting 'n' greater than 1.`)
  }
}
