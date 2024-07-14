import { CompletionParams } from '../../../src/chat'

export const MESSAGES_WITH_ASSISTANT_TOOL_CALLS_AND_TOOL_RESULTS: CompletionParams['messages'] =
  [
    {
      role: 'user',
      content: "What's the weather in San Francisco, Tokyo, and Paris?",
    },
    {
      role: 'assistant',
      content:
        'I will use the get_current_weather tool to find the weather in San Francisco, Tokyo and Paris.',
      tool_calls: [
        {
          id: 'tool-call-id-1',
          type: 'function',
          function: {
            name: 'get_current_weather',
            arguments: '{"location": "San Francisco, CA"}',
          },
        },
        {
          id: 'tool-call-id-2',
          type: 'function',
          function: {
            name: 'get_current_weather',
            arguments: '{"location": "Tokyo, Japan"}',
          },
        },
        {
          id: 'tool-call-id-3',
          type: 'function',
          function: {
            name: 'get_current_weather',
            arguments: '{"location": "Paris, France"}',
          },
        },
      ],
    },
    {
      tool_call_id: 'tool-call-id-1',
      role: 'tool',
      content: '{"temperature":"72","unit":"fahrenheit"}',
    },
    {
      tool_call_id: 'tool-call-id-2',
      role: 'tool',
      content: '{"temperature":"10","unit":"celsius"}',
    },
    {
      tool_call_id: 'tool-call-id-3',
      role: 'tool',
      content: '{"temperature":"22","unit":"fahrenheit"}',
    },
  ]
