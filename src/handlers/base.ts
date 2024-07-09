import { CompletionParams } from "../chat";
import { CompletionResponse, ConfigOptions, InputError, LLMChatModel, StreamCompletionResponse } from "./types";

export abstract class BaseHandler<T extends LLMChatModel> {
  opts: ConfigOptions;
  protected models: readonly T[]
  protected supportsJSON: readonly T[]

  constructor(opts: ConfigOptions, models: readonly T[], supportsJSON: readonly T[]) {
    this.opts = opts
    this.models = models
    this.supportsJSON = supportsJSON
  }

  abstract create(
    body: CompletionParams,
  ): Promise<CompletionResponse | StreamCompletionResponse>;

  protected validateInputs(body: CompletionParams): void {
    if (!this.isSupportedModel(body.model)) {
      throw new InputError(`Invalid 'model' field: ${body.model}.`)
    }

    for (const message of body.messages) {
      if (message.role === 'function') {
        throw new InputError(`The 'function' role is deprecated. Please use the 'tool' role instead.`)
      }
    }
  
    if (body.response_format?.type === 'json_object') {
      if (!this.supportsJSONMode(body.model)) {
        throw new InputError(`The model ${body.model} does not support the 'response_format' type 'json_object'.`)
      }

      let containsJSONString: boolean = false
      for (const message of body.messages) {
        if (typeof message.content === 'string') {
          if (message.content.toLowerCase().includes('json')) {
            containsJSONString = true
            break
          }
        } else if (Array.isArray(message.content)) {
          for (const e of message.content) {
            if (e.type === 'text') {
              if (e.text.toLowerCase().includes('json')) {
                containsJSONString = true
                break
              }
            }
          }
        }
      }

      if (!containsJSONString) {
        throw new InputError(`You must include the string 'JSON' somewhere in your prompt when the 'response_format' type is 'json_object'.`)
      }
    }
  }

  protected isSupportedModel(model: LLMChatModel): model is T {
    return this.models.includes(model as T)
  }

  protected supportsJSONMode(
    model: T
  ): boolean {
    return this.supportsJSON.includes(model)
  }
}
