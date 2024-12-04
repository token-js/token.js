# Generic OpenAI compatible model providers
Token.js can be used with any model provider with an API that is compatible with the OpenAI v1 API spec. This integration has been tested specifically with Ollama, if you run into problems with other providers please let us know by opening an issue.

## Usage
This example demonstrates using the Ollama running locally with Token.js.

Optionally, you may specify an API key with an environment variable. Typically, you would not need to specify this with Ollama but you may need to one for other model providers.
{% code title=".env" %}
```bash
OPENAI_COMPATIBLE_API_KEY=
```
{% endcode %}

```typescript
import { TokenJS } from 'token.js'

// Create the Token.js client and specify the baseURL for the OpenAI v1 API compatible provider
const tokenjs = new TokenJS({
  baseURL: 'http://127.0.0.1:11434/v1/',
})

async function main() {
  // Create a model response
  const completion = await tokenjs.chat.completions.create({
    // Specify the provider and model
    provider: 'openai-compatible',
    model: 'llama3.2',
    // Define your messages
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

## Compatibility
You can use any model provider that is compatible with the OpenAI v1 API spec with Token.js. However, different providers and models have a wide range of support for different features. We recommend reviewing the documentation of the providers you are using if you run into problems with various features supported by Token.js such as image input, tool use, and streaming as these features may not always be supported.

## OpenAI Compatible Providers
There are a variety of different API providers that are compatible with the OpenAI v1 API spec and can be used with Token.js. Here are a few commonly used ones. If you often use a different OpenAI compatible provider, please make a PR to expand this list to help others.

* [LocalAI](https://localai.io/)
* [Ollama](https://github.com/ollama/ollama)

## Official Support for Specific Providers
While Token.js may be used with any model provider that is compatible with the OpenAI API spec, we do not consider such providers to be offically supported. Token.js aims to provide official support for model providers commonly used by our community. Official support includes dedicated integration testing, better documentation on the features supported by the provider, and improved type support. If you are using an OpenAI API compatible provider and would like it to be officially supported by Token.js please let us know by opening an issue on Github.