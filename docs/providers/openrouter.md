# Perplexity

[Get an OpenRouter API key](https://openrouter.ai/settings/keys)

## Usage

{% code title=".env" %}
```bash
OPENROUTER_API_KEY=
```
{% endcode %}

```typescript
import { TokenJS } from 'token.js'

// Create the Token.js client
const tokenjs = new TokenJS()

async function main() {
  // Create a model response
  const completion = await tokenjs.chat.completions.create({
    // Specify the provider and model
    provider: 'openrouter',
    model: 'nvidia/nemotron-4-340b-instruct',
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

## Compatibility
OpenRouter supports more than 180 models from a variety of providers which may have varying feature support. We recommend reviewing the OpenRouter and provider documentation for specific compatibility information.

## Additional Resources

* [Supported Models](https://openrouter.ai/models)
* [OpenRouter Documentation](https://openrouter.ai/docs/quick-start)