/* eslint-disable */
import * as dotenv from 'dotenv'
import { ChatCompletionToolMessageParam } from 'openai/resources/index.mjs'

import { LLM } from '../../src'
import { CompletionParams } from '../../src/chat'
import { getCurrentWeather } from './utils'

dotenv.config()

const llm = new LLM()

async function runConversation() {
  // const provider: CompletionParams['provider'] = 'openai'
  // const model: CompletionParams['model'] = 'gpt-4o'
  // const provider: CompletionParams['provider'] = 'cohere'
  // const model: CompletionParams['model'] = 'command-r-plus'
  const provider: CompletionParams['provider'] = 'gemini'
  const model: CompletionParams['model'] = 'gemini-1.5-pro'

  const messages: CompletionParams['messages'] = [
    {
      role: 'user',
      content:
        "What's the weather in San Francisco, Tokyo, and Paris?",
    },
  ]
  const response = await llm.chat.completions.create({
    provider,
    model,
    messages,
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_current_weather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA',
              },
              unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
            },
            required: ['location'],
          },
        },
      },
    ],
    // tool_choice: 'required'
    // tool_choice: 'none'
    // tool_choice: {
    //   type: 'function',
    //   function: {
    //     name: 'get_current_weather'
    //   }
    // },
  })
  const responseMessage = response.choices[0].message

  const toolCalls = responseMessage.tool_calls
  if (responseMessage.tool_calls) {
    const availableFunctions = {
      get_current_weather: getCurrentWeather,
    }
    messages.push(responseMessage)

    if (!toolCalls) {
      throw new Error(`No tool calls.`)
    }

    for (let i = toolCalls.length - 1; i >= 0; i--) {
      const toolCall = toolCalls[i]
    // for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name
      const functionToCall = availableFunctions[functionName]
      const functionArgs = JSON.parse(toolCall.function.arguments)
      const functionResponse = functionToCall(
        functionArgs.location,
        functionArgs.unit
      )
      const message: ChatCompletionToolMessageParam = {
        tool_call_id: toolCall.id,
        role: 'tool',
        content: functionResponse,
      }
      messages.push(message)
    }
    const secondResponse = await llm.chat.completions.create({
      provider,
      model,
      messages,
    })

    console.log(secondResponse.choices[0].message.content)
  }
}

runConversation()
