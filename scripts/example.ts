import * as dotenv from 'dotenv'
import { OpenAI } from 'openai'

import { objectTemplate as anthropicObjectTemplate } from '@libretto/anthropic'
import { objectTemplate as openaiObjectTemplate } from '@libretto/openai'
import { TokenJS } from '../src'
dotenv.config()

const callLLMOpenAI = async () => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    openaiObjectTemplate([
      {
        role: 'system',
        content:
          'You are an angry comedian that tells jokes in an irate tone, but are very funny and original.',
      },
      {
        role: 'user',
        content: `{joke_topic}`,
      },
    ])

  const tokenjs = new TokenJS()
  const result = await tokenjs.chat.completions.create({
    provider: 'openai',
    model: 'gpt-4o-mini',
    messages,
    libretto: {
      promptTemplateName: 'tokenjs-events-openai',
      templateParams: {
        joke_topic: 'Tell me a joke about the moon.',
      },
    },
  })

  console.log(result.choices)
}

const callLLMAnthropic = async () => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    anthropicObjectTemplate([
      {
        role: 'system',
        content:
          'You are an angry comedian that tells jokes in an irate tone, but are very funny and original.',
      },
      {
        role: 'user',
        content: `{joke_topic}`,
      },
    ])

  const tokenjs = new TokenJS()
  const result = await tokenjs.chat.completions.create({
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20240620',
    messages,
    libretto: {
      promptTemplateName: 'tokenjs-events-anthropic',
      templateParams: {
        joke_topic: 'Tell me a joke about the moon.',
      },
    },
  })

  console.log(result.choices[0].message)
}

const callOpenAiChatHistory = async () => {
  console.log(`Calling callOpenAiChatHistory...`)

  const tokenjs = new TokenJS()
  const result = await tokenjs.chat.completions.create({
    provider: 'openai',
    model: 'gpt-4o-mini',
    messages: openaiObjectTemplate([
      {
        role: 'system',
        content:
          'You are a happy chatbot. No matter how angry someone gets with you, you always respond over the top with happiness.',
      },
      {
        role: 'chat_history',
        content: '{chat_history}',
      },
      {
        role: 'user',
        content: `{joke_topic}`,
      },
    ]) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    libretto: {
      promptTemplateName: 'tokenjs-openai-chathistory',
      templateParams: {
        joke_topic:
          "Tell me a joke about the ice cream man and make sure it's funny.",
        chat_history: [
          {
            role: 'user',
            content: 'You are awful, and not good at telling jokes.',
          },
          {
            role: 'assistant',
            content: "I'm sorry to hear that. I'll try to do better.",
          },
        ],
      },
    },
  })

  console.log(result.choices)
}

//callLLMOpenAI()
//callLLMAnthropic()
callOpenAiChatHistory()
