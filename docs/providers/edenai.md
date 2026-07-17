# Eden AI

[Get an Eden AI API key](https://app.edenai.run/)

## Usage

{% code title=".env" %}
```bash
EDENAI_API_KEY=
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
    provider: 'edenai',
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
Eden AI is an EU-based, OpenAI-compatible LLM gateway that provides access to models from a variety of providers which may have varying feature support. We recommend reviewing the Eden AI and provider documentation for specific compatibility information.

## Additional Resources

* [Eden AI](https://www.edenai.co)
* [Eden AI Documentation](https://www.edenai.co/docs)
