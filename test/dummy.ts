import { ChatCompletionTool } from 'openai/resources/index.mjs'

import { CompletionParams } from '../src/chat'

export const getDummyTool = (): ChatCompletionTool => {
  return { function: { name: 'myFunction' }, type: 'function' }
}

export const getDummyMessages = (): CompletionParams['messages'] => [
  { role: 'user', content: 'dummyMessage' },
]

export const getDummyMessagesWithImage = (): CompletionParams['messages'] => [
  {
    role: 'user',
    content: [
      {
        type: 'text',
        text: 'Here is some text',
      },
      {
        type: 'image_url',
        image_url: {
          url: 'http://example.com/image.jpg',
        },
      },
    ],
  },
]
