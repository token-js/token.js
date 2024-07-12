import { ChatCompletionTool } from 'openai/resources/index'
import { describe, expect, it } from 'vitest'

import { CompletionParams } from '../../src/chat'
import {
  convertMessages,
  convertTools,
  toCohereTool,
} from '../../src/handlers/cohere'
import { getDummyTool } from '../dummy'

describe('toCohereTool', () => {
  it('converts simple type', () => {
    const input: ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'query_daily_sales_report',
        description:
          'Connects to a database to retrieve overall sales volumes and sales information for a given day.',
        parameters: {
          type: 'object',
          properties: {
            day: {
              description:
                'Retrieves sales data for this day, formatted as YYYY-MM-DD.',
              type: 'string',
            },
          },
          required: ['day'],
        },
      },
    }

    const expected = {
      name: 'query_daily_sales_report',
      description:
        'Connects to a database to retrieve overall sales volumes and sales information for a given day.',
      parameterDefinitions: {
        day: {
          description:
            'Retrieves sales data for this day, formatted as YYYY-MM-DD.',
          type: 'str',
          required: true,
        },
      },
    }

    expect(toCohereTool(input)).toEqual(expected)
  })

  it('converts array with string element type', () => {
    const input: ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'query_daily_sales_report',
        description:
          'Connects to a database to retrieve overall sales volumes and sales information for numerous days.',
        parameters: {
          type: 'object',
          properties: {
            days: {
              description:
                'Retrieves sales data for these days, formatted as YYYY-MM-DD.',
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['days'],
        },
      },
    }

    const expected = {
      name: 'query_daily_sales_report',
      description:
        'Connects to a database to retrieve overall sales volumes and sales information for numerous days.',
      parameterDefinitions: {
        days: {
          description:
            'Retrieves sales data for these days, formatted as YYYY-MM-DD.',
          type: 'List[str]',
          required: true,
        },
      },
    }

    expect(toCohereTool(input)).toEqual(expected)
  })

  it('converts array without specific element type', () => {
    const input: ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'query_daily_sales_report',
        description:
          'Connects to a database to retrieve overall sales volumes and sales information for numerous days.',
        parameters: {
          type: 'object',
          properties: {
            days: {
              description:
                'Retrieves sales data for these days, formatted as YYYY-MM-DD.',
              type: 'array',
            },
          },
          required: ['days'],
        },
      },
    }

    const expected = {
      name: 'query_daily_sales_report',
      description:
        'Connects to a database to retrieve overall sales volumes and sales information for numerous days.',
      parameterDefinitions: {
        days: {
          description:
            'Retrieves sales data for these days, formatted as YYYY-MM-DD.',
          type: 'List',
          required: true,
        },
      },
    }

    expect(toCohereTool(input)).toEqual(expected)
  })

  it('converts shallow object', () => {
    const input: ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'plot_daily_sales_volume',
        description: 'Produce a graph from daily sales volume data.',
        parameters: {
          type: 'object',
          properties: {
            sales_data: {
              description:
                'Produces a graph from sales volume data. The key is the day, formatted as YYYY-MM-DD, and the value is the number of sales',
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
            },
          },
          required: ['sales_data'],
        },
      },
    }

    const expected = {
      name: 'plot_daily_sales_volume',
      description: 'Produce a graph from daily sales volume data.',
      parameterDefinitions: {
        sales_data: {
          description:
            'Produces a graph from sales volume data. The key is the day, formatted as YYYY-MM-DD, and the value is the number of sales',
          type: 'Dict[str, int]',
          required: true,
        },
      },
    }

    expect(toCohereTool(input)).toEqual(expected)
  })

  it('converts deep object', () => {
    const input: ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'analyze_user_activity',
        description: 'Analyzes user activity data.',
        parameters: {
          type: 'object',
          properties: {
            user_details: {
              description: 'Details of the user activity.',
              type: 'object',
              properties: {
                name: {
                  description: 'Name of the user.',
                  type: 'string',
                },
                activity: {
                  description: 'Different activities of the user.',
                  type: 'object',
                  properties: {
                    login_dates: {
                      description: 'Dates when the user logged in.',
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                  },
                  required: ['login_dates'],
                },
              },
              required: ['name', 'activity'],
            },
          },
          required: ['user_details'],
        },
      },
    }

    const expected = {
      name: 'analyze_user_activity',
      description: 'Analyzes user activity data.',
      parameterDefinitions: {
        user_details: {
          description: 'Details of the user activity.',
          type: 'Dict',
          required: true,
          properties: {
            name: {
              description: 'Name of the user.',
              type: 'str',
              required: true,
            },
            activity: {
              description: 'Different activities of the user.',
              type: 'Dict',
              required: true,
              properties: {
                login_dates: {
                  description: 'Dates when the user logged in.',
                  type: 'List[str]',
                  required: true,
                },
              },
            },
          },
        },
      },
    }
    expect(toCohereTool(input)).toEqual(expected)
  })
})

describe('convertTools', () => {
  it(`returns undefined when 'tool_choice' is 'none'`, () => {
    expect(convertTools([getDummyTool()], 'none')).equals(undefined)
  })
})

describe('convertMessages', () => {
  it(`converts assistant message containing tool calls followed by tool results`, async () => {
    const inputMessages: CompletionParams['messages'] = [
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
            id: 'call_bpTZd0ZYSfftrQiQGTPXBwNk',
            type: 'function',
            function: {
              name: 'get_current_weather',
              arguments: '{"location": "San Francisco, CA"}',
            },
          },
          {
            id: 'call_VWSHWXKfxHfyAbLy6K6vfFM9',
            type: 'function',
            function: {
              name: 'get_current_weather',
              arguments: '{"location": "Tokyo, Japan"}',
            },
          },
          {
            id: 'call_lhMKBlOSnwwq5BZDCGo5SVTJ',
            type: 'function',
            function: {
              name: 'get_current_weather',
              arguments: '{"location": "Paris, France"}',
            },
          },
        ],
      },
      {
        tool_call_id: 'call_bpTZd0ZYSfftrQiQGTPXBwNk',
        role: 'tool',
        content: '{"temperature":"72","unit":"fahrenheit"}',
      },
      {
        tool_call_id: 'call_VWSHWXKfxHfyAbLy6K6vfFM9',
        role: 'tool',
        content: '{"temperature":"10","unit":"celsius"}',
      },
      {
        tool_call_id: 'call_lhMKBlOSnwwq5BZDCGo5SVTJ',
        role: 'tool',
        content: '{"temperature":"22","unit":"fahrenheit"}',
      },
    ]

    const { messages, lastUserMessage, toolResults } =
      convertMessages(inputMessages)

    expect(lastUserMessage).toEqual('')
    expect(messages).toEqual([
      {
        role: 'USER',
        message: "What's the weather in San Francisco, Tokyo, and Paris?",
      },
      {
        role: 'CHATBOT',
        message:
          'I will use the get_current_weather tool to find the weather in San Francisco, Tokyo and Paris.',
        toolCalls: [
          {
            name: 'get_current_weather',
            parameters: {
              location: 'San Francisco, CA',
            },
          },
          {
            name: 'get_current_weather',
            parameters: {
              location: 'Tokyo, Japan',
            },
          },
          {
            name: 'get_current_weather',
            parameters: {
              location: 'Paris, France',
            },
          },
        ],
      },
    ])
    expect(toolResults).toEqual([
      {
        call: {
          name: 'get_current_weather',
          parameters: {
            location: 'San Francisco, CA',
          },
        },
        outputs: [
          {
            temperature: '72',
            unit: 'fahrenheit',
          },
        ],
      },
      {
        call: {
          name: 'get_current_weather',
          parameters: {
            location: 'Tokyo, Japan',
          },
        },
        outputs: [
          {
            temperature: '10',
            unit: 'celsius',
          },
        ],
      },
      {
        call: {
          name: 'get_current_weather',
          parameters: {
            location: 'Paris, France',
          },
        },
        outputs: [
          {
            temperature: '22',
            unit: 'fahrenheit',
          },
        ],
      },
    ])
  })
})
