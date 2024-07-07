import { OpenAI } from 'openai';
import { LLM } from '../src';
import * as dotenv from 'dotenv';
dotenv.config();

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: 'system', 
    content: `Answer the user's question concisely.`
  },
  {
    role: 'user',
    content: `Tell me a joke about the moon.`
  },
  {
    role: 'user',
    content: `Tell me a joke about the moon.`
  },
  {
    role: 'assistant',
    content: 'The moon is a little round! Haha!'
  },
  {
    role: 'user',
    content: `Then, tell me a joke about a dog.`
  },
]

const callLLM = async () => {
  const llm = new LLM()
  const result = await llm.chat.completions.create({
    stream: true,
    messages,
    model: 'bedrock/mistral.mistral-7b-instruct-v0:2',
    // model: 'bedrock/mistral.mixtral-8x7b-instruct-v0:1',
    // model: 'bedrock/mistral.mistral-large-2402-v1:0',
  })

  // console.log(result.choices[0].message.content)

  for await (const part of result) {
    process.stdout.write(part.choices[0]?.delta?.content || "");
  }
}

const callOpenAI = async () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const result = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o',
    stream: true
  })

  for await (const part of result) {
    console.log(part.choices[0].finish_reason);
  }

  // console.log(result.choices[0].message.content)
}

// callOpenAI()
callLLM()
