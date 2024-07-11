---
description: >-
  Integrate all LLM providers with a single Typescript SDK using OpenAIs format.
  Free and opensource with no proxy server required.
---

# token.js

## Features

* Define prompts in OpenAIs format and have them translated automatially for each LLM provider.
* Support for tools, JSON output, image inputs, streaming, and more.
* Support for 10 popular LLM providers: AI21, Anthropic, AWS Bedrock, Cohere, Gemini, Groq, Mistral, OpenAI, Perplexity, and Azure with more coming soon.
* Completely free and opensource.
* No proxy server required.

## Setup

### Installation

{% tabs %}
{% tab title="npm" %}
```bash
npm install token.js
```
{% endtab %}

{% tab title="pnpm" %}
```bash
pnpm install token.js
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add token.js
```
{% endtab %}

{% tab title="bun" %}
```bash
bun add token.js
```
{% endtab %}
{% endtabs %}

### Usage

Import the token.js client and call the `create` function with the same input messages you would use with OpenAIs SDK. Specify the model and LLM provider you would like use with their respective fields.

{% tabs %}
{% tab title="OpenAI" %}
{% code title=".env" %}
```bash
OPENAI_API_KEY=<openai api key>
```
{% endcode %}

{% code fullWidth="false" %}
```ts
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

// Import and create the token.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await tokenjs.chat.completions.create({
  // Specify the target model and provider
  provider: 'openai',
  model: 'gpt-4o',
  messages,
})
```
{% endcode %}
{% endtab %}

{% tab title="Anthropic" %}
{% code title=".env" %}
```bash
ANTHROPIC_API_KEY=<anthropic api key>
```
{% endcode %}

```typescript
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

// Import and create the token.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await tokenjs.chat.completions.create({
  // Specify the target model and provider
  provider: 'anthropic',
  model: 'claude-2.0',
  messages,
})
```
{% endtab %}

{% tab title="Gemini" %}
{% code title=".env" %}
```bash
GEMINI_API_KEY=<gemini api key>
```
{% endcode %}

```typescript
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

// Import and create the token.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await tokenjs.chat.completions.create({
  // Specify the target model and provider
  provider: 'gemini',
  model: 'gemini-1.5-pro',
  messages,
})
```
{% endtab %}

{% tab title="Bedrock" %}
{% code title=".env" %}
```bash
AWS_REGION_NAME=<aws region>
AWS_ACCESS_KEY_ID=<aws access key id>
AWS_SECRET_ACCESS_KEY=<aws secret access key>
```
{% endcode %}

```typescript
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

// Import and create the token.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await tokenjs.chat.completions.create({
  // Specify the target model and provider
  provider: 'bedrock',
  model: 'amazon.titan-text-express-v1',
  messages,
})
```
{% endtab %}

{% tab title="Cohere" %}
{% code title=".env" %}
```bash
COHERE_API_KEY=<cohere api key>
```
{% endcode %}

```typescript
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

// Import and create the token.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await tokenjs.chat.completions.create({
  // Specify the target model and provider
  provider: 'cohere',
  model: 'command-r',
  messages,
})
```
{% endtab %}

{% tab title="Mistral" %}
{% code title=".env" %}
```bash
MISTRAL_API_KEY=<mistral api key>
```
{% endcode %}

```typescript
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

// Import and create the token.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await tokenjs.chat.completions.create({
  // Specify the target model and provider
  provider: 'mistral',
  model: 'mistral-large-2402',
  messages,
})
```
{% endtab %}
{% endtabs %}

### Access Credentials

We recommend using environment variables to configure the credentials for each LLM provider.

```bash
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

### Streaming

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

### Tools

token.js supports tools for all providers and models that support it.

<pre class="language-ts"><code class="lang-ts">import { TokenJS, ChatCompletionTool } from 'token.js'

const tokenjs = new TokenJS()

const tools: ChatCompletionTool[] = [{
<strong>  type: 'function',
</strong>  function: {
    name: 'getCurrentWeather',
    description: 'Get the current weather in a given location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        unit: {
          type: 'string',
          description: 'The temperature unit, e.g. Fahrenheit or Celsius'
        },
      },
      required: ['location', 'unit'],
    },
  },
}]

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
</code></pre>

## Feature Compatibility

Not every feature is supported by every provider and model. This table provides a general overview of what features are supported by each provider. For details on which features are supported by individual models from different providers see the provider documentation.

| Provider   | Completion           | Streaming            | Tools                | JSON Output          | Image Input          |
| ---------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| OpenAI     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Anthropic  | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Bedrock    | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Mistral    | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |                      |
| Cohere     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |                      |                      |
| AI21       | :white\_check\_mark: | :white\_check\_mark: |                      |                      |                      |
| Gemini     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Groq       | :white\_check\_mark: | :white\_check\_mark: |                      | :white\_check\_mark: |                      |
| Perplexity | :white\_check\_mark: | :white\_check\_mark: |                      |                      |                      |

If there are providers or features you would like to see implemented in token.js please let us know by opening an issue on [Github](https://github.com/token-js/token.js?tab=readme-ov-file#contributing)!

## Contributing

token.js is free and opensource under the GPLv3 license. If you would like to contribute, [please visit our Github.](https://github.com/token-js/token.js?tab=readme-ov-file#contributing)
