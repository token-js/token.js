# Perplexity

[Get a Perplexity API key](https://www.perplexity.ai/settings/api)

## Usage

{% code title=".env" %}
```bash
PERPLEXITY_API_KEY=
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
    provider: 'perplexity',
    model: 'llama-3-70b-instruct',
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

<!-- compatibility -->
## Supported Models

| Model                             | Chat Completion | Streaming | JSON Output | Image Input | Function Calling | N > 1 |
| --------------------------------- | --------------- | --------- | ----------- | ----------- | ---------------- | ----- |
| llama-3.1-sonar-small-128k-online | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| llama-3.1-sonar-large-128k-online | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| llama-3.1-sonar-huge-128k-online  | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |

### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |
<!-- end compatibility -->

## Additional Resources

* [Perplexity Documentation](https://docs.perplexity.ai/)