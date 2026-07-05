# Token.js

Integrate 200+ LLMs with one TypeScript SDK using OpenAI's format. Free and open source. No proxy server required.

## Features

* Use OpenAI's format to call 200+ LLMs from 10+ providers.
* Supports tools, JSON outputs, image inputs, streaming, and more.
* Runs completely on the client side. No proxy server needed.
* Free and open source under MIT.

## Supported Providers

* AI21
* Anthropic
* AWS Bedrock
* Cohere
* Gemini
* Groq
* Mistral
* OpenAI
* Perplexity
* OpenRouter
* Any other model provider with an OpenAI compatible API

## [Documentation](https://docs.tokenjs.ai/)

## Setup

### Installation

```bash
npm install token.js
```

### Usage

Import the Token.js client and call the `create` function with a prompt in OpenAI's format. Specify the model and LLM provider using their respective fields.

```bash
OPENAI_API_KEY=<openai api key>
```
```ts
import { TokenJS } from 'token.js'

// Create the Token.js client
const tokenjs = new TokenJS()

async function main() {
  // Create a model response
  const completion = await tokenjs.chat.completions.create({
    // Specify the provider and model
    provider: 'openai',
    model: 'gpt-4o',
    // Define your message
    messages: [
      {
        role: 'user',
        content: 'Hello!',
      },
    ],
  })
  console.log(completion.choices[0])
}
main()
```

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
# OpenRouter
OPENROUTER_API_KEY=
# AWS Bedrock
AWS_REGION_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
# OpenAI Compatible
OPENAI_COMPATIBLE_API_KEY=
```

### Streaming

Token.js supports streaming responses for all providers that offer it.

```ts
import { TokenJS } from 'token.js'

const tokenjs = new TokenJS()

async function main() {
  const result = await tokenjs.chat.completions.create({
    stream: true,
    provider: 'openai',
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Tell me about yourself.`,
      },
    ],
  })

  for await (const part of result) {
    process.stdout.write(part.choices[0]?.delta?.content || '')
  }
}
main()
```

### Function Calling

Token.js supports the function calling tool for all providers and models that offer it.

```ts
import { TokenJS, ChatCompletionTool } from 'token.js'

const tokenjs = new TokenJS()

async function main() {
  const tools: ChatCompletionTool[] = [
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
          },
          required: ['location'],
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

  console.log(result.choices[0].message.tool_calls)
}
main()
```

### Extending Model Support

Token.js allows you to extend the predefined model list using the `extendModelList` method. Here are some example scenarios where this is useful:
1. Adding AWS Bedrock models with regional prefixes like `us.anthropic.claude-3-sonnet`
2. Supporting new model versions before they're added to the predefined list
3. Using custom model deployments with unique names
4. Adding experimental or beta models during testing

```ts
import { TokenJS } from 'token.js'

// Example in 2 steps: Adding AWS Bedrock Claude models with region prefix
const tokenjs = new TokenJS();
// Step 1: Register the new model name
tokenjs.extendModelList(
  "bedrock",
  'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  "anthropic.claude-3-sonnet-20240229-v1:0" // Copy features from existing model
);

// Step 2: Using the extended model in a chat completion
const result = await tokenjs.chat.completions.create({
  stream: true,
  provider: 'bedrock',
  model: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0' as any, // Type casting as 'any' required
  messages: [
    {
      role: 'user',
      content: 'Tell me about yourself.',
    },
  ],
});
```

Note: When using extended models, type casting (`as any`) is required

The `featureSupport` parameter can be either:
- A string matching an existing model name from the same provider to copy its feature support
- An object specifying which features the model supports:
  | Feature    | Type    | Description                                  |
  |------------|---------|----------------------------------------------|
  | streaming  | boolean | Whether the model supports streaming responses|
  | json       | boolean | Whether the model supports JSON mode         |
  | toolCalls  | boolean | Whether the model supports function calling  |
  | images     | boolean | Whether the model supports image inputs      |

## Feature Compatibility

This table provides an overview of the features that Token.js supports from each LLM provider.

| Provider   | Chat Completion           | Streaming            | Function Calling Tool                | JSON Output          | Image Input          |
| ---------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| OpenAI     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Anthropic  | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Bedrock    | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Mistral    | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |  :heavy_minus_sign:  |
| Cohere     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |  :heavy_minus_sign:  |  :heavy_minus_sign:  |
| AI21       | :white\_check\_mark: | :white\_check\_mark: |  :heavy_minus_sign:  |  :heavy_minus_sign:  |  :heavy_minus_sign:  |
| Gemini     | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: | :white\_check\_mark: |
| Groq       | :white\_check\_mark: | :white\_check\_mark: |  :heavy_minus_sign:  | :white\_check\_mark: |  :heavy_minus_sign:  |
| Perplexity | :white\_check\_mark: | :white\_check\_mark: |  :heavy_minus_sign:  |  :heavy_minus_sign:  |  :heavy_minus_sign:  |
| OpenRouter | :white\_check\_mark: | :white\_check\_mark: |  :white\_check\_mark:  |  :white\_check\_mark: |  :white\_check\_mark:  |
| OpenAI Compatible | :white\_check\_mark: | :white\_check\_mark: |  :white\_check\_mark:  |  :white\_check\_mark: |  :white\_check\_mark:  |

### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |

**Note**: Certain LLMs, particularly older or weaker models, do not support some features in this table. For details about these restrictions, see our [LLM provider documentation](https://docs.tokenjs.ai/providers).

## Contributing

See our [Contributing guide](./CONTRIBUTING.md) to learn how to contribute to Token.js.

## Issues

Please let us know if there's any way that we can improve Token.js by opening an issue!

## License

Token.js is free and open source software licensed under [MIT](https://github.com/token-js/token.js/blob/main/LICENSE).
