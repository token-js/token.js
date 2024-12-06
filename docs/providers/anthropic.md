# Anthropic

[Get an Anthropic API key](https://console.anthropic.com/settings/keys)

## Usage

{% code title=".env" %}
```bash
ANTHROPIC_API_KEY=
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
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
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

| Model                      | Chat Completion | Streaming | JSON Output | Image Input | Function Calling | N > 1 |
| -------------------------- | --------------- | --------- | ----------- | ----------- | ---------------- | ----- |
| claude-3-5-sonnet-latest   | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| claude-3-5-haiku-latest    | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| claude-3-opus-latest       | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| claude-3-5-sonnet-20240620 | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| claude-3-5-haiku-20241022  | ✅               | ✅         | ➖           | ➖           | ✅                | ➖     |
| claude-3-opus-20240229     | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| claude-3-sonnet-20240229   | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| claude-3-haiku-20240307    | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| claude-2.1                 | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| claude-2.0                 | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| claude-instant-1.2         | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |

### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |
<!-- end compatibility -->

## Additional Resources

* [Anthropic Documentation](https://docs.anthropic.com)
