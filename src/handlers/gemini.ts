import OpenAI from "openai";
import { ChatCompletionContentPart } from "openai/resources/index.mjs";
import { CompletionResponse, GeminiModel, InputError, StreamCompletionResponse } from "./types";
import { 
  GoogleGenerativeAI, 
  Content,
  Part,
  GenerativeModel,
  FinishReason,
  UsageMetadata
} from "@google/generative-ai"
import { consoleWarn, getTimestamp, parseImage } from "./utils";
import { CompletionParams } from "../chat";
import { BaseHandler } from "./base";

const convertContentToPart = (content: Array<ChatCompletionContentPart>): Part[] => {
  if (typeof content === "string") {
    return [{
      text: content
    }]
  } else {
    return content.map((part) => {
      if (part.type === "text") {
        return {
          text: part.text
        }
      } else if (part.type === "image_url") {
        const imageData = parseImage(part.image_url.url)
        return {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.content
          }
        }
      } else {
        throw new InputError(`Invalid content part type: ${(part as any).type}. Must be "text" or "image_url".`)
      }
    })
  }
}

const convertMessageToContent  = (message: OpenAI.Chat.Completions.ChatCompletionMessageParam): Content => {
  if (typeof message.content === "string") {
    return { 
      role: message.role,
      parts: [{
        text: message.content
      }]
    }
  } else if (Array.isArray(message.content)) {
    return {
      role: message.role,
      parts: convertContentToPart(message.content)
    }
  } else {
    return {
      role: message.role,
      parts: []
    }
  }
}

const convertFinishReason = (finishReason: FinishReason): 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' => {
  switch (finishReason) {
    case FinishReason.STOP:
      return 'stop'
    case FinishReason.MAX_TOKENS:
      return 'length'
    case FinishReason.SAFETY:
      return 'content_filter'
    case FinishReason.OTHER:
    case FinishReason.FINISH_REASON_UNSPECIFIED:
    case FinishReason.RECITATION:
      return 'stop'
    default:
      return 'stop'
  }
}

const fetchResponse = async (
  model: GenerativeModel,
  body: CompletionParams
): Promise<CompletionResponse> => {
  const timestamp = getTimestamp()
  const result = await model.generateContent({
    contents: body.messages.map(convertMessageToContent),
  })

  return {
    id: null,
    object: 'chat.completion',
    created: timestamp,
    model: model.model,
    choices: result.response.candidates?.map((candidate) => {
      return {
        index: candidate.index,
        finish_reason: candidate.finishReason ? convertFinishReason(candidate.finishReason) : 'stop',
        message: {
          // Google's format doesn't perfectly fit into OpenAIs format when there are multiple possible results
          // Namely OpenAI expects the content to be a single string, but Google's API may return multiple objects in the content array
          // which may be different types (text, image, function call, code execution, etc.)
          // I chose to handle this for now by just only supporting text and concatenating the results together, but this is definitely
          // not ideal. A fully custom response format could improve this.
          content: candidate.content.parts.map((part) => part.text).join(''),
          role: 'assistant'
        },
        // Google does not support logprobs
        logprobs: null
        // There are also some other fields that Google returns that are not supported in the OpenAI format such as citations and safety ratings
      }
    }) ?? [],
    usage: result.response.usageMetadata ? convertUsageData(result.response.usageMetadata) : undefined
  }
}

const convertUsageData = (usageMetadata: UsageMetadata): CompletionResponse['usage'] => {
  return {
    completion_tokens: usageMetadata.candidatesTokenCount,
    prompt_tokens: usageMetadata.promptTokenCount,
    total_tokens: usageMetadata.totalTokenCount
  }
}

async function* fetchStreamResponse(
  model: GenerativeModel,
  body: CompletionParams
): StreamCompletionResponse {
  const timestamp = getTimestamp()
  const result = await model.generateContentStream({
    contents: body.messages.map(convertMessageToContent)
  })

  for await (const chunk of result.stream) {
    const text = chunk.text()
    yield {
      id: null,
      object: 'chat.completion.chunk',
      created: timestamp,
      model: model.model,
      choices: chunk.candidates?.map((candidate) => {
        return {
          index: candidate.index,
          finish_reason: candidate.finishReason ? convertFinishReason(candidate.finishReason) : 'stop',
          delta: {
            content: text,
            role: 'assistant'
          },
          logprobs: null
        }
      }) ?? [],
      usage: chunk.usageMetadata ? convertUsageData(chunk.usageMetadata) : undefined
    }
  }
}


// To support a new provider, we just create a handler for them extending the BaseHandler class and implement the create method.
// Then we update the Handlers object in src/handlers/utils.ts to include the new handler.
export class GeminiHandler extends BaseHandler<GeminiModel> {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse> {
    this.validateInputs(body)

    const apiKey = this.opts.apiKey ?? process.env.GEMINI_API_KEY;
    if (apiKey === undefined) {
      throw new InputError("API key is required for Gemini, define GEMINI_API_KEY in your environment or specifty the apiKey option.");
    }

    if (this.opts.baseURL) {
      consoleWarn(`The 'baseUrl' will be ignored by Gemini because it does not support this field.`)
    }

    const responseMimeType = body.response_format?.type === 'json_object' ? "application/json" : undefined
    const stop = typeof body.stop === 'string' ? [body.stop] : body.stop
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: body.model,
      generationConfig: {
        maxOutputTokens: body.max_tokens ?? undefined,
        temperature: body.temperature ?? undefined,
        topP: body.top_p ?? undefined,
        stopSequences: stop ?? undefined,
        candidateCount: body.n ?? undefined,
        responseMimeType
      }
      // Google also supports configurable safety settings which do not fit into the OpenAI format (this was an issue for us in the past, so we'll likely need to address it at some point)
      // Google also supports cached content which does not fit into the OpenAI format
    })

    if (body.stream) {
      return fetchStreamResponse(model, body)
    } else {
      return fetchResponse(model, body)
    }
  }
}