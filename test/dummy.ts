import { ChatCompletionTool } from "openai/resources/index.mjs";
import { CompletionParams } from "../src/chat";

export const getDummyTool = (): ChatCompletionTool => { return { function: { name: 'myFunction'}, type: 'function'}}

export const getDummyMessages = (): CompletionParams['messages'] => [
  { role: 'user', content: 'dummyMessage' },
]
