import { OpenAI } from 'openai';
import { LLM } from '../src';
import * as dotenv from 'dotenv';
dotenv.config();

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: 'user',
    content: `Tell me a joke about the moon.`
  },
]

const callLLM = async () => {
  const llm = new LLM()
  const result = await llm.chat.completions.create({
    stream: true,
    messages,
    model: 'gpt-4o'
  })

  // console.log(result.choices[0].message.content)

  for await (const part of result) {
    process.stdout.write(part.choices[0]?.delta?.content || "");
  }

  // We can also stream and the response type is correctly inferred, uncomment to check
  // const stream = await llm.chat.completions.create({
  //   stream: true,
  //   messages,
  //   model: 'gpt-4o'
  // })
}

const callOpenAI = async () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const result = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o'
  })

  console.log(result.choices[0].message.content)
}

callLLM()
