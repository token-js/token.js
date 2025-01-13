import { LLMChat } from './chat/index.js'
import { ConfigOptions } from './userTypes/index.js'
export * from './models.js'
export * from './userTypes/index.js'

// Extract the public interface from OpenAI, including both properties and methods
// type PublicInterface<T> = {
//   [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : T[K]
// }

// Pick the properties we want to expose from OpenAI and use them to construct our own client interface
// We omit the _client property from the completions object because it is not needed
// type Completions = Omit<
//   Pick<PublicInterface<OpenAI>['chat'], 'completions'>['completions'],
//   '_client'
// >

// type Chat = {
//   completions: Completions
// }

type TokenJSInterface = {
  chat: LLMChat
}

export class TokenJS implements TokenJSInterface {
  private opts: ConfigOptions
  chat: LLMChat

  constructor({ ...opts }: ConfigOptions = {}) {
    this.opts = opts

    // We pass a reference to the LLM instance to the LLMChat instance so that the completions object can access the opts
    this.chat = new LLMChat(opts)
  }
}
