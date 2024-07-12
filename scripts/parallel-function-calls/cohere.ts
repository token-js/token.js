import { CohereClient } from 'cohere-ai'
import { ChatRequest } from 'cohere-ai/api'
import * as dotenv from 'dotenv'

import { getCurrentWeather } from './utils'

dotenv.config()

const apiKey = process.env.COHERE_API_KEY
const cohere = new CohereClient({ token: apiKey })

const runConversation = async () => {
  const model = 'command-r-plus'
  const messages = [
    {
      role: 'USER',
      message: "What's the weather in San Francisco, Tokyo, and Paris?",
    },
  ]

  const tools = [
    {
      name: 'get_current_weather',
      description: 'Get the current weather in a given location',
      parameterDefinitions: {
        location: {
          description: 'The city and state, e.g. San Francisco, CA',
          type: 'str',
          required: true,
        },
        unit: { type: 'str', required: false },
      },
    },
  ]

  const response = await cohere.chat({
    message: messages[0].message,
    model,
    tools,
  })

  const toolCalls = response.toolCalls

  const chatHistory = response.chatHistory

  if (toolCalls && toolCalls?.length > 0) {
    const availableFunctions: { [key: string]: (location: string) => string } =
      {
        get_current_weather: getCurrentWeather,
      }

    const toolResults: ChatRequest['toolResults'] = []

    for (const toolCall of toolCalls) {
      const functionName = toolCall.name
      const functionToCall = availableFunctions[functionName]
      const functionArgs = toolCall.parameters

      const functionResponse = functionToCall(functionArgs.location as any)
      toolResults.push({
        call: toolCall,
        outputs: [JSON.parse(functionResponse)],
      })
    }

    const input = {
      message: '',
      model,
      chatHistory,
      tools,
      toolResults,
    }

    const finalResponse = await cohere.chat(input)
    console.log(JSON.stringify(finalResponse, null, 2))
  }
}

runConversation()
