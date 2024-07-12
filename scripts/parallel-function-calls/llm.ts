import * as dotenv from 'dotenv'
import { ChatCompletionToolMessageParam } from 'openai/resources/index.mjs'

import { CompletionParams } from '../../src/chat'
import { TokenJS } from '../../src/index'
import { models } from '../../src/models'
import { getCurrentWeather } from './utils'

dotenv.config()

const client = new TokenJS()

// Parse CLI arguments
const args = process.argv.slice(2)
let provider: CompletionParams['provider'] | undefined
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--provider' && i + 1 < args.length) {
    provider = args[i + 1] as CompletionParams['provider']
    break
  }
}

async function runConversation() {
  if (provider === undefined) {
    throw new Error(
      'Provider argument is required. Usage: --provider <provider_name>'
    )
  }

  const model: CompletionParams['model'] = models[provider].models[0]

  const messages: CompletionParams['messages'] = [
    {
      role: 'system',
      content: "Respond to the user's question, using tools when necessary.",
    },
    {
      role: 'user',
      content: "What's the weather in San Francisco, Tokyo, and Paris?",
    },
    {
      role: 'system',
      content: "To reiterate, respond to the user's question, using tools when necessary.",
    },
  ]
  const tools: CompletionParams['tools'] = [
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
  ]

  const response = await client.chat.completions.create({
    provider,
    model,
    messages,
    tools,
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

    for (const toolCall of toolCalls) {
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
    messages.push({ content: 'Hi', role: 'user' })
    const secondResponse = await client.chat.completions.create({
      provider,
      model,
      messages,
      tools,
    })

    console.log(JSON.stringify(secondResponse, null, 2))
  } else {
    console.log('No tool calls.\n')
    console.log(JSON.stringify(response, null, 2))
  }
}

runConversation()
