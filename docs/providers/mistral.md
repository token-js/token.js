# Mistral

[Get a Mistral API key](https://console.mistral.ai/api-keys/)

## Usage

{% code title=".env" %}
```bash
MISTRAL_API_KEY=
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
    provider: 'mistral',
    model: 'mistral-large-2402',
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

| Model                   | Chat Completion | Streaming | JSON Output | Image Input | Function Calling | N > 1 |
| ----------------------- | --------------- | --------- | ----------- | ----------- | ---------------- | ----- |
| open-mistral-7b         | ✅               | ➖         | ✅           | ➖           | ➖                | ➖     |
| mistral-tiny-2312       | ✅               | ➖         | ✅           | ➖           | ➖                | ➖     |
| open-mixtral-8x7b       | ✅               | ➖         | ➖           | ➖           | ➖                | ➖     |
| mistral-small-2312      | ✅               | ➖         | ➖           | ➖           | ➖                | ➖     |
| open-mixtral-8x22b      | ✅               | ➖         | ✅           | ➖           | ✅                | ➖     |
| open-mixtral-8x22b-2404 | ✅               | ➖         | ✅           | ➖           | ✅                | ➖     |
| mistral-small-latest    | ✅               | ➖         | ➖           | ➖           | ✅                | ➖     |
| mistral-small-2402      | ✅               | ➖         | ➖           | ➖           | ✅                | ➖     |
| mistral-medium-latest   | ✅               | ➖         | ➖           | ➖           | ➖                | ➖     |
| mistral-medium-2312     | ✅               | ➖         | ➖           | ➖           | ➖                | ➖     |
| mistral-large-latest    | ✅               | ➖         | ✅           | ➖           | ✅                | ➖     |
| mistral-large-2402      | ✅               | ➖         | ✅           | ➖           | ✅                | ➖     |
| codestral-latest        | ✅               | ➖         | ✅           | ➖           | ➖                | ➖     |
| codestral-2405          | ✅               | ➖         | ✅           | ➖           | ➖                | ➖     |

### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |
<!-- end compatibility -->

## Additional Resources

* [Mistral Documentation](https://docs.mistral.ai)
