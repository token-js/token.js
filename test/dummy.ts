import { CompletionParams } from '../src/chat'

export const getDummyMessages = (): CompletionParams['messages'] => [
  { role: 'user', content: 'dummyMessage' },
]
