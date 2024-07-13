# token.js

Integrate 9 LLM providers with a single Typescript SDK using OpenAIs format. Free and opensource with no proxy server required.

### [Documentation](http://tokenjs.ai)

## Features

* Define prompts in OpenAIs format and have them translated automatially for each LLM provider.
* Support for tools, JSON output, image inputs, streaming, and more.
* Support for 9 popular LLM providers: AI21, Anthropic, AWS Bedrock, Cohere, Gemini, Groq, Mistral, OpenAI, and Perplexity with more coming soon.
* Free and opensource under GPLv3.
* No proxy server required.

## Setup

### Installation

```bash
npm install token.js
```

### Environment Variables

```env
OPENAI_API_KEY=<your openai api key>
GEMINI_API_KEY=<your gemini api key>
ANTHROPIC_API_KEY=<your api>
```

### Usage

```ts
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

const tokenjs = new TokenJS()

const messages: ChatCompletionMessageParam[] = [
  {
    role: 'user',
    content: `How are you?`,
  },
]

// Call OpenAI
const result = await tokenjs.chat.completions.create({
  provider: 'openai',
  model: 'gpt-4o',
  messages,
})

// Call Gemini
const result = await tokenjs.chat.completions.create({
  provider: 'gemini',
  model: 'gemini-1.5-pro',
  messages,
})

// Call Anthropic
const result = await tokenjs.chat.completions.create({
  provider: 'anthropic',
  model: 'claude-2.0',
  messages,
})
```

## Access Credential Configuration

token.js uses environment variables to configure access to different LLM providers. Configure your api keys using the following environment variables:

```
# OpenAI
OPENAI_API_KEY=

# AI21
AI21_API_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Cohere
COHERE_API_KEY=

# Gemini
GEMINI_API_KEY=

# Groq
GROQ_API_KEY=

# Mistral
MISTRAL_API_KEY=

# Perplexity
PERPLEXITY_API_KEY=

# AWS Bedrock
AWS_REGION_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Then you can select the `provider` and `model` you would like to use when calling the `create` function, and token.js will use the correct access credentials for the provider.

## Streaming

token.js supports streaming for all providers that support it.

```ts
import { TokenJS } from 'token.js'

const tokenjs = new TokenJS()
const result = await tokenjs.chat.completions.create({
  stream: true,
  provider: 'gemini',
  model: 'gemini-1.5-pro',
  messages: [
    {
      role: 'user',
      content: `How are you?`,
    },
  ],
})

for await (const part of result) {
  process.stdout.write(part.choices[0]?.delta?.content || '')
}
```

## Tools

token.js supports tools for all providers and models that support it.

```ts
import { TokenJS, ChatCompletionTool } from 'token.js'

const tokenjs = new TokenJS()

const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getCurrentWeather',
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
        required: ['location', 'unit'],
      },
    },
  },
]

const result = await tokenjs.chat.completions.create({
  provider: 'gemini',
  model: 'gemini-1.5-pro',
  messages: [
    {
      role: 'user',
      content: `What's the weather like in San Francisco?`,
    },
  ],
  tools,
  tool_choice: 'auto',
})
```

## Providers

Not every feature is supported by every provider and model. This table provides a general overview of what features are supported by each provider. For details on which features are supported by individual models from different providers see the [provider documentation](todo\(md\)/).

| Provider   | Completion           | Streaming            | Tools                | JSON Output          | Image Input          |
| ---------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| openai     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| anthropic  | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| bedrock    | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| mistral    | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |                      |
| cohere     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |                      |                      |
| AI21       | :white\_check\_mark: | :white\_check\_mark: |                      |                      |                      |
| Gemini     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Groq       | :white\_check\_mark: | :white\_check\_mark: |                      | :white\_check\_mark: |                      |
| Perplexity | :white\_check\_mark: | :white\_check\_mark: |                      |                      |                      |

If there are more providers or features you would like to see implemented in token.js please let us know by opening an issue!

## Contributing

PRs are accepted!

### Clone the repo

```bash
git clone https://github.com/token-js/token-js.git
```

### Open the project and install the dependencies

```bash
cd llm && pnpm install
```

### Test your changes

```bash
pnpm test
```

### Run the linter

```bash
pnpm lint
```

### Open a pull request!

## License

token.js is free and open source under the GPLv3 license.
