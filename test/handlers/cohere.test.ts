import { ChatCompletionTool } from 'openai/resources/index.mjs'
import { describe, expect, it } from 'vitest'

import { toCohereTool } from '../../src/handlers/cohere'

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
