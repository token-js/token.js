# Requesty

[Get a Requesty API key](https://app.requesty.ai/router)

## Usage

{% code title=".env" %}
```bash
REQUESTY_API_KEY=
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
    provider: 'requesty',
    model: 'openai/gpt-4o-mini',
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
Requesty is an OpenAI-compatible LLM router that provides access to models from a variety of providers which may have varying feature support. We recommend reviewing the Requesty and provider documentation for specific compatibility information.

## Additional Resources

* [Supported Models](https://app.requesty.ai/router/list)
* [Requesty Documentation](https://docs.requesty.ai)
