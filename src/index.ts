import OpenAI, { ClientOptions } from 'openai';
import { LLMChat } from './chat';
import { ConfigOptions } from './handlers/types';

// Extract the public interface from OpenAI, including both properties and methods
type PublicInterface<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : T[K];
};

// Pick the properties we want to expose from OpenAI and use them to construct our own client interface
// We omit the _client property from the completions object because it is not needed
type Completions = Omit<Pick<PublicInterface<OpenAI>['chat'], 'completions'>['completions'], '_client'>

type Chat = {
  completions: Completions;
}

type LLMInterface = {
  chat: Chat;
}

export class LLM implements LLMInterface {
  private opts: ConfigOptions;
  chat: LLMChat;

  constructor({
    ...opts
  }: ConfigOptions = {}) {
    this.opts = opts;

    // We pass a reference to the LLM instance to the LLMChat instance so that the completions object can access the opts
    this.chat = new LLMChat(opts);
  }
}