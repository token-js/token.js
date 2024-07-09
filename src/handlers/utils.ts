import { AnthropicHandler } from "./anthropic";
import { GeminiHandler } from "./gemini";
import { MistralHandler } from "./mistral";
import { OpenAIHandler } from "./openai";
import { ConfigOptions, InputError, LLMChatModel, MIMEType } from "./types";
import { BaseHandler } from "./base";
import chalk from 'chalk'
import { CohereHandler } from "./cohere";
import { BedrockHandler } from "./bedrock";
import { GroqHandler } from "./groq";
import axios from 'axios'
import { CompletionParams, LLMChat } from "../chat";
import { ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { AI21Handler } from "./ai21";
import { ModelPrefix } from "../constants";
import { PERPLEXITY_PREFIX, PerplexityHandler } from "./perplexity";
import { models } from "../models";

export const Handlers: Record<string, (opts: ConfigOptions) => any> = {
  [ModelPrefix.OpenAI]: (opts: ConfigOptions) => new OpenAIHandler(opts, models.openai.models, models.openai.supportsJSON),
  [ModelPrefix.Anthropic]: (opts: ConfigOptions) => new AnthropicHandler(opts, models.anthropic.models, models.anthropic.supportsJSON),
  [ModelPrefix.Gemini]: (opts: ConfigOptions) => new GeminiHandler(opts, models.gemini.models, models.gemini.supportsJSON),
  [ModelPrefix.Cohere]: (opts: ConfigOptions) => new CohereHandler(opts, models.cohere.models, models.cohere.supportsJSON),
  [ModelPrefix.Bedrock]: (opts: ConfigOptions) => new BedrockHandler(opts, models.bedrock.models, models.bedrock.supportsJSON),
  [ModelPrefix.Mistral]: (opts: ConfigOptions) => new MistralHandler(opts, models.mistral.models, models.mistral.supportsJSON),
  [ModelPrefix.Groq]: (opts: ConfigOptions) => new GroqHandler(opts, models.groq.models, models.groq.supportsJSON),
  [ModelPrefix.AI21]: (opts: ConfigOptions) => new AI21Handler(opts, models.ai21.models, models.ai21.supportsJSON),
  [PERPLEXITY_PREFIX]: (opts: ConfigOptions) => new PerplexityHandler(opts, models.perplexity.models, models.perplexity.supportsJSON),
};

export const getHandler = (modelName: string, opts: ConfigOptions): BaseHandler<any> => {
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

export const normalizeTemperature = (temperature: number, model: LLMChatModel): number => {
  if (model.startsWith(ModelPrefix.Anthropic) || model.startsWith(ModelPrefix.Cohere) || model.startsWith(ModelPrefix.Mistral)) {
    return temperature / 2
  } else if (model.startsWith(ModelPrefix.Bedrock)) {
    const parsedModel = model.replace(ModelPrefix.Bedrock, '')
    if (parsedModel.startsWith('amazon') || parsedModel.startsWith('anthropic') || parsedModel.startsWith('cohere') || parsedModel.startsWith('mistral') || parsedModel.startsWith('meta')) {
      return temperature / 2
    }
  }

  return temperature
}

export const isEmptyObject = (variable: any): boolean => {
  return variable && typeof variable === 'object' && variable.constructor === Object && Object.keys(variable).length === 0
}

export const isObject = (variable: any): boolean => {
  return variable && typeof variable === 'object' && variable.constructor === Object
}
