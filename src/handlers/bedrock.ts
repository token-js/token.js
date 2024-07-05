import { BedrockRuntimeClient, InternalServerException, InvokeModelCommand, InvokeModelCommandInput, InvokeModelWithResponseStreamCommand, InvokeModelWithResponseStreamCommandInput, InvokeModelWithResponseStreamCommandOutput } from "@aws-sdk/client-bedrock-runtime";
import { CompletionParams } from "../chat";
import { BaseHandler, CompletionResponse, CompletionResponseChunk, InputError, LLMChatModel, MessageRole, StreamCompletionResponse } from "./types";
import { consoleWarn, getTimestamp } from "./utils";

export interface ChatCompletionMessageParam {
  content: string;
  role: string
}

const convertRole = (
  role: MessageRole
): string => {
  if (role === 'assistant') {
    return 'Bot'
  } else if (role === 'system') {
    return 'System'
  } else if (role === 'user') {
    return 'User'
  } else {
    throw new InputError(`Unknown role: ${role}`)
  }
}

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

const convertCompletionReason = (
  completionReason: string
): CompletionResponse['choices'][0]['finish_reason'] => {
  if (completionReason === 'FINISHED' || completionReason === 'STOP_CRITERIA_MET') {
    return 'stop'
  } else if (completionReason === 'LENGTH') {
    return 'length'
  } else if (completionReason === 'RAG_QUERY_WHEN_RAG_DISABLED') {
    throw new Error(`The query failed because RAG is disabled.`)
  } else if (completionReason === 'CONTENT_FILTERED') {
    return 'content_filter'
  } else {
    return 'unknown'
  }
}

/**
 * Converts the user-defined messages into the format expected by Titan.
 * ref: https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-titan-text.html
 */
const convertMessagesToInputText = (
  messages: CompletionParams['messages']
): string => {
  let converted: string[] = []
  for (const message of messages) {
    if (message.role === 'user' || message.role === 'assistant' || message.role === 'system') {
      const convertedRole = convertRole(message.role)
      if (typeof message.content === 'string') {
        converted.push(`${convertedRole}: ${message.content}`)
      } else if (Array.isArray(message.content)) {
        for (const e of message.content) {
          if (e.type === 'text') {
            converted.push(`${convertedRole}: ${message.content}`)
          }
        }
      }
    }
  }

  return converted
    .join('\n');
};

async function* createCompletionResponseStreaming(
  response: InvokeModelWithResponseStreamCommandOutput,
  model: LLMChatModel,
  created: number,
): StreamCompletionResponse {
  const id = response.$metadata.requestId ?? null
  if (response.body === undefined) {
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
    for await (const stream of response.body) {
      if (stream.internalServerException) {
        throw stream.internalServerException
      } else if (stream.modelStreamErrorException) {
        throw stream.modelStreamErrorException
      } else if (stream.modelTimeoutException) {
        throw stream.modelTimeoutException
      } else if (stream.throttlingException) {
        throw stream.throttlingException
      } else if (stream.validationException) {
        throw stream.validationException
      }

      let delta: CompletionResponseChunk['choices'][0]['delta']
      let finishReason: CompletionResponseChunk['choices'][0]['finish_reason']
      if (stream.chunk?.bytes === undefined) {
        delta = {}
        finishReason = null
      } else {
        const decoded = JSON.parse(new TextDecoder('utf-8').decode(stream.chunk?.bytes))
        delta = {
          content: decoded.outputText,
          role: 'assistant'
        }
        finishReason = typeof decoded.completionReason === 'string' ? convertCompletionReason(decoded.completionReason) : decoded.completionReason
      }

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

export class BedrockHandler extends BaseHandler {
  async create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>  {
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
    if (typeof body.n === 'number' && body.n > 1) {
      throw new InputError(`Bedrock does not support setting 'n' greater than 1.`)
    }

    const inputText = convertMessagesToInputText(body.messages)
    const temperature = typeof body.temperature === 'number'
      // We divide by two because Bedrock's temperature range is 0 to 1 and the input temperature
      // range is 0 to 2.
      ? body.temperature / 2
      : undefined
    const topP = body.top_p ?? undefined
    const maxTokens = body.max_tokens ?? undefined
    const stopSequences = convertStopSequences(body.stop)
    const modelId = body.model.startsWith('bedrock/') ? body.model.replace('bedrock/', '') : body.model

    const payload = {
      inputText,
      textGenerationConfig: {
        maxTokenCount: maxTokens,
        stopSequences,
        temperature,
        topP,
      },
    };
    const commandInput = {
      body: JSON.stringify(payload),
      modelId
    }
    const client = new BedrockRuntimeClient({  region,   credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    }, });

    if (body.stream === true) {
      const command = new InvokeModelWithResponseStreamCommand(commandInput)
      const created = getTimestamp()
      const response = await client.send(command)
      return createCompletionResponseStreaming(response, body.model, created)
    } else {
      const command = new InvokeModelCommand(commandInput)
      const created = getTimestamp()
      const response = await client.send(command);

      const decodedResponseBody = new TextDecoder().decode(response.body);
      const responseBody = JSON.parse(decodedResponseBody);
      const result = responseBody.results[0]

      const convertedResponse: CompletionResponse = {
        id: response.$metadata.requestId ?? null,
        usage: {
          prompt_tokens: responseBody.inputTextTokenCount,
          total_tokens: result.tokenCount,
          completion_tokens: responseBody.inputTextTokenCount + result.tokenCount
        },
        choices: [{
          index: 0,
          logprobs: null,
          message: {
            content: result.outputText,
            role: 'assistant'
          },
          finish_reason: convertCompletionReason(result.completionReason)
        }],
        created,
        model: body.model,
        object: 'chat.completion'
      }
      return convertedResponse
    }
  }
}

