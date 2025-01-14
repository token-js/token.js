# Groq

[Get a Groq API key](https://console.groq.com/keys)

## Usage

{% code title=".env" %}
```bash
GROQ_API_KEY=
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
    provider: 'groq',
    model: 'llama3-70b-8192',
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
| llama-3.3-70b-versatile | ✅               | ✅         | ✅           | ➖           | ➖                | ➖     |
| llama-3.1-8b-instant    | ✅               | ✅         | ✅           | ➖           | ➖                | ➖     |
| llama3-8b-8192          | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| llama3-70b-8192         | ✅               | ✅         | ✅           | ➖           | ➖                | ➖     |
| mixtral-8x7b-32768      | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| gemma-7b-it             | ✅               | ✅         | ✅           | ➖           | ➖                | ➖     |
| gemma2-9b-it            | ✅               | ✅         | ✅           | ➖           | ➖                | ➖     |

### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |
<!-- end compatibility -->

## Additional Resources

* [Groq Documentation](https://console.groq.com/docs/quickstart)
