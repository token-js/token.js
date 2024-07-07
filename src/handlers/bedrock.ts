import { BedrockRuntimeClient, ContentBlock, ConverseCommand, ConverseCommandInput, ConverseResponse, ConverseStreamCommand, ConverseStreamCommandOutput, ImageFormat, InternalServerException, InvokeModelCommand, InvokeModelCommandInput, InvokeModelWithResponseStreamCommand, InvokeModelWithResponseStreamCommandInput, InvokeModelWithResponseStreamCommandOutput, ResponseStream, SystemContentBlock } from "@aws-sdk/client-bedrock-runtime";
import { CompletionParams } from "../chat";
import { BedrockModel, CompletionResponse, CompletionResponseChunk, ConfigOptions, InputError, InvariantError, LLMChatModel, MessageRole, MIMEType, StreamCompletionResponse } from "./types";
import { consoleWarn, fetchThenParseImage, getTimestamp, normalizeTemperature } from "./utils";
import { ChatCompletionContentPart, ChatCompletionContentPartImage, ChatCompletionContentPartText } from "openai/resources/index.mjs";
import { ModelPrefix } from "../constants";
import { BaseHandler } from "./base";
import { ResponseFormat } from "@mistralai/mistralai";


const normalizeMIMEType = (
  mimeType: MIMEType
): ImageFormat => {
  if (mimeType === 'image/gif') {
    return 'gif'
  } else if (mimeType === 'image/jpeg') {
    return 'jpeg'
  } else if (mimeType === 'image/png') {
    return 'png'
  } else if (mimeType === 'image/webp') {
    return 'webp'
  } else {
    throw new InvariantError(`Unsupported MIME type: ${mimeType}`)
  }
}

const isBedrockModel = (model: LLMChatModel): model is BedrockModel => {
  return model.startsWith(ModelPrefix.Bedrock)
}

const supportsImages = (
  model: LLMChatModel
): boolean => {
  if (isBedrockModel(model)) {
    if (model === 'bedrock/anthropic.claude-3-haiku-20240307-v1:0' || model === 'bedrock/anthropic.claude-3-opus-20240229-v1:0' || model === 'bedrock/anthropic.claude-3-sonnet-20240229-v1:0') {
      return true
    } else {
      return false
    }
  } else {
    throw new Error(`Only detects Bedrock models.`)
  }
}

const supportsSystemMessages = (
  model: LLMChatModel
): boolean => {
  return (model !== 'bedrock/cohere.command-light-text-v14' && model !== 'bedrock/cohere.command-text-v14' && model !== 'bedrock/amazon.titan-text-express-v1' && model !== 'bedrock/amazon.titan-text-lite-v1' && model !== "bedrock/mistral.mistral-7b-instruct-v0:2" && model !== "bedrock/mistral.mixtral-8x7b-instruct-v0:1")
}

const supportsAssistantMessages = (
  model: LLMChatModel
): boolean => {
  return (model !== 'bedrock/cohere.command-light-text-v14' && model !== 'bedrock/cohere.command-text-v14')
}

const convertMessages = async (
  messages: CompletionParams['messages'],
  model: LLMChatModel
): Promise<{ systemMessages: Array<SystemContentBlock> | undefined, messages: ConverseCommandInput['messages']}> => {
  const makeTextContent = (
    role: string,
    content: string
  ): string => {
    if (role === 'system') {
      return `System: ${content}`
    } else if (
      // We prepend 'Assistant: ' if the model doesn't support messages from the 'assistant' role in
      // order to differentiate it from user messages in this situation.
      !supportsAssistantMessages(model) && role === 'assistant'
    ) {
      return `Assistant: ${content}`
    } else {
      return content
    }
  }


  const output: ConverseCommandInput['messages'] = [];
  const clonedMessages = structuredClone(messages)

  const systemMessages: Array<SystemContentBlock> = []
  if (supportsSystemMessages(model)) {
    for (const message of clonedMessages) {
      if (message.role === 'system') {
        systemMessages.push({ text: message.content })
        clonedMessages.shift();
      } else {
        break
      }
    }
  }

  // Bedrock's SDK includes Anthropic, which requires that the first message in the array is from a
  // 'user' role, so we inject a placeholder user message if the array doesn't already begin with a
  // message from a 'user' or 'system' role. (The 'system' messages will be converted into user
  // messages later, which is why we don't include this placeholder if the array begins with a
  // system message).
  if (clonedMessages[0].role !== 'user' && clonedMessages[0].role !== 'system') {
    clonedMessages.unshift({
      role: 'user',
      content: 'Empty'
    })
  }

  let previousRole: 'user' | 'assistant' = 'user'
  let currentParams: Array<ContentBlock.ImageMember |ContentBlock.TextMember> = []
  for (const message of clonedMessages) {
    if (message.role === 'user' || message.role === 'assistant' || message.role === 'system')  {
      // Bedrock doesn't support the `system` role in their `messages` array, so if the user
      // defines system messages that are interspersed with user and assistant messages, we
      // replace the system messages with the `user` role. We'll also prepend 'System: ' to its
      // content later. We do this instead of putting every system message in Bedrock's `system`
      // parameter so that the order of the user-defined `messages` remains the same.
      let newRole: 'user' | 'assistant'
      if (supportsAssistantMessages(model)) {
        newRole = message.role === 'user' || message.role === 'system' ? 'user' : 'assistant'
      } else {
        // We'll always use the 'user' role if the model also doesn't support assistant messages.
        newRole = 'user'
      }

      if (previousRole !== newRole) {
        output.push({
          role: previousRole,
          content: currentParams
        })
        currentParams = []
      }

      if (typeof message.content === 'string') {
        const text = makeTextContent(message.role, message.content)
        currentParams.push({
          text: text
        })
      } else if (Array.isArray(message.content)) {
        const convertedContent: Array<ContentBlock.ImageMember | ContentBlock.TextMember> = await Promise.all(message.content.map(async e => {
          if (e.type === 'text') {
            const text = makeTextContent(message.role, e.text)
            return {
              text
            }
          } else {
            const parsedImage = await fetchThenParseImage(e.image_url.url)
            return {
              image: {
                format: normalizeMIMEType(parsedImage.mimeType),
                source: {
                  bytes: new TextEncoder().encode(parsedImage.content)
                }
              },
            }
          }
        }))
        currentParams.push(...convertedContent)
      }

      previousRole = newRole
    }
  }

  if (currentParams.length > 0) {
    output.push({
      role: previousRole,
      content: currentParams
    })
  }

  return {
    systemMessages: systemMessages.length > 0 ? systemMessages : undefined,
    messages: output
  }
};

const convertStopSequences = (
  stop?: CompletionParams['stop']
): Array<string> | undefined => {
  if (stop === null || stop === undefined) {
    return undefined
  } else if (typeof stop === 'string') {
    return [stop]
  } else if (Array.isArray(stop) && stop.every(e => typeof e === 'string')) {
    return stop
  } else {
    throw new Error(`Unknown stop sequence type: ${stop}`)
  }
}

const convertStopReason = (
  completionReason: ConverseResponse['stopReason']
): CompletionResponse['choices'][0]['finish_reason'] => {
  if (completionReason === 'content_filtered' || completionReason === 'guardrail_intervened') {
    return 'content_filter'
  } else if (completionReason === 'end_turn' || completionReason === 'stop_sequence') {
    return 'stop'
  } else if (completionReason === 'max_tokens') {
    return 'length'
  } else if (completionReason === 'tool_use') {
    return 'tool_calls'
  } else {
    return 'unknown'
  }
}

async function* createCompletionResponseStreaming(
  response: ConverseStreamCommandOutput,
  model: LLMChatModel,
  created: number,
): StreamCompletionResponse {
  const id = response.$metadata.requestId ?? null
  if (response.stream === undefined) {
    const convertedResponse: CompletionResponseChunk = {
      id,
      choices: [{
        index: 0,
        finish_reason: null,
        logprobs: null,
        delta: {}
      }],
      created,
      model,
      object: 'chat.completion.chunk'
    }
    yield convertedResponse
  } else {
    for await (const stream of response.stream) {
      if (stream.internalServerException) {
        throw stream.internalServerException
      } else if (stream.modelStreamErrorException) {
        throw stream.modelStreamErrorException
      } else if (stream.throttlingException) {
        throw stream.throttlingException
      } else if (stream.validationException) {
        throw stream.validationException
      }

      if (stream.messageStart?.role === 'user') {
        throw new InvariantError(`Received a message from the 'user' role.`)
      }

      const finishReason = typeof stream.messageStop?.stopReason === 'string' ? convertStopReason(stream.messageStop.stopReason) : null
      const delta: CompletionResponseChunk['choices'][0]['delta'] = typeof stream.contentBlockDelta?.delta?.text === 'string' ?  {
        content: stream.contentBlockDelta.delta.text,
        role: 'assistant'
      } : {}

      const convertedResponse: CompletionResponseChunk = {
        id,
        choices: [{
          index: 0,
          finish_reason: finishReason,
          logprobs: null,
          delta
        }],
        created,
        model,
        object: 'chat.completion.chunk'
      }
      yield convertedResponse
    }
  }
}

export class BedrockHandler extends BaseHandler<BedrockModel> {
  validateInputs(
    body: CompletionParams,
  ): void {
    super.validateInputs(body)

    let logImageDetailWarning: boolean = false
    for (const message of body.messages) {
      if (Array.isArray(message.content)) {
        for (const e of message.content) {
          if (e.type === 'image_url') {
            if (!supportsImages(body.model)) {
              throw new InputError(`Model '${body.model}' does not support images. Remove any images from the prompt or use a model that supports images.`)
            } else if (e.image_url.detail !== undefined && e.image_url.detail !== 'auto') {
              logImageDetailWarning = true
            }
          }
        }
      }
    }
  
    if (logImageDetailWarning) {
      consoleWarn(`Bedrock does not support the 'detail' field for images. The default image quality will be used.`)
    }
  
    if (typeof body.n === 'number' && body.n > 1) {
      throw new InputError(`Bedrock does not support setting 'n' greater than 1.`)
    }
  }  

  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
    this.validateInputs(body)

    if (this.opts.baseURL) {
      consoleWarn(`The 'baseUrl' parameter will be ignored by Bedrock because it does not support this field.`)
    }
    if (typeof this.opts.apiKey === 'string') {
      consoleWarn(`The 'apiKey' parameter will be ignored by Bedrock, which uses the 'accessKeyId' and 'secretAccessKey' fields on the 'bedrock' object instead.`)
    }

    const region = this.opts.bedrock?.region ?? process.env.AWS_REGION_NAME
    if (!region) {
      throw new InputError("No AWS region detected. Please define a region using either the 'region' parameter on the 'bedrock' object or the 'AWS_REGION_NAME' environment variable.");
    }
    const accessKeyId = this.opts.bedrock?.accessKeyId ?? process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = this.opts.bedrock?.secretAccessKey ?? process.env.AWS_SECRET_ACCESS_KEY;
    const missingCredentials: Array<{ envVar: string, param: string }> = [];
    if (!accessKeyId) {
      missingCredentials.push({envVar: 'AWS_ACCESS_KEY_ID', param: 'accessKeyId'});
    }
    if (!secretAccessKey) {
      missingCredentials.push({envVar: 'AWS_SECRET_ACCESS_KEY', param: 'secretAccessKey'});
    }
    if (missingCredentials.length > 0) {
      throw new InputError(`Missing AWS credentials: ${missingCredentials.map(c => c.envVar).join(', ')}. Please define these environment variables or supply them using the following parameters on the 'bedrock' object: ${missingCredentials.map(c => c.param).join(', ')}.`);
    }

    const { systemMessages, messages } = await convertMessages(body.messages, body.model)
    const temperature = typeof body.temperature === 'number' ? normalizeTemperature(body.temperature, body.model) : undefined
    const topP = body.top_p ?? undefined
    const maxTokens = body.max_tokens ?? undefined
    const stopSequences = convertStopSequences(body.stop)
    const modelId = body.model.startsWith('bedrock/') ? body.model.replace('bedrock/', '') : body.model

    const convertedParams: ConverseCommandInput = {
      inferenceConfig: {
        maxTokens,
        stopSequences,
        temperature,
        topP
      },
      modelId,
      messages,
      system: systemMessages
    }
    const client = new BedrockRuntimeClient({  region,   credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    }, });

    if (body.stream === true) {
      const command = new ConverseStreamCommand(convertedParams)
      const created = getTimestamp()
      const response = await client.send(command)
      return createCompletionResponseStreaming(response, body.model, created)
    } else {
      const command = new ConverseCommand(convertedParams)
      const created = getTimestamp()
      const response = await client.send(command);

      const usage = response.usage && typeof response.usage.inputTokens === 'number' && typeof response.usage.outputTokens === 'number' && typeof response.usage.totalTokens === 'number' ? {
        prompt_tokens: response.usage.inputTokens,
        completion_tokens: response.usage.outputTokens,
        total_tokens: response.usage.inputTokens + response.usage.outputTokens
      } : undefined
      const content = response.output?.message?.content?.map(c => c.text).join('\n\n') ?? ''

      const convertedResponse: CompletionResponse = {
        id: response.$metadata.requestId ?? null,
        usage,
        choices: [{
          index: 0,
          logprobs: null,
          message: {
            content,
            role: 'assistant'
          },
          finish_reason: convertStopReason(response.stopReason)
        }],
        created,
        model: body.model,
        object: 'chat.completion'
      }
      return convertedResponse
    }
  }
}

