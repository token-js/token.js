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

  console.log(result.choices)
}

//callOpenAI()
//callLLMOpenAI()
callLLMAnthropic()
