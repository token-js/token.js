# OpenAI

[Get an OpenAI API key](https://platform.openai.com/account/api-keys)

## Usage

{% code title=".env" %}
```bash
OPENAI_API_KEY=
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

<!-- compatibility -->
## Supported Models

| Model                      | Chat Completion | Streaming | JSON Output | Image Input | Function Calling | N > 1 |
| -------------------------- | --------------- | --------- | ----------- | ----------- | ---------------- | ----- |
| gpt-4.5-preview            | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4.5-preview-2025-02-27 | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4.1                    | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4.1-2025-04-14         | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4.1-mini               | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4.1-mini-2025-04-14    | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4.1-nano               | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4.1-nano-2025-04-14    | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4o                     | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4o-mini                | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4o-2024-05-13          | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4o-2024-08-06          | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4-turbo                | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4-turbo-2024-04-09     | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4-0125-preview         | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4-turbo-preview        | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4-1106-preview         | ✅               | ✅         | ✅           | ✅           | ✅                | ✅     |
| gpt-4-vision-preview       | ✅               | ✅         | ✅           | ✅           | ➖                | ✅     |
| gpt-4                      | ✅               | ✅         | ➖           | ➖           | ✅                | ✅     |
| gpt-4-0314                 | ✅               | ✅         | ➖           | ➖           | ➖                | ✅     |
| gpt-4-0613                 | ✅               | ✅         | ➖           | ➖           | ✅                | ✅     |
| gpt-4-32k                  | ✅               | ✅         | ➖           | ➖           | ➖                | ✅     |
| gpt-4-32k-0314             | ✅               | ✅         | ➖           | ➖           | ➖                | ✅     |
| gpt-4-32k-0613             | ✅               | ✅         | ➖           | ➖           | ➖                | ✅     |
| gpt-3.5-turbo              | ✅               | ✅         | ✅           | ➖           | ✅                | ✅     |
| gpt-3.5-turbo-16k          | ✅               | ✅         | ➖           | ➖           | ➖                | ✅     |
| gpt-3.5-turbo-0301         | ✅               | ✅         | ➖           | ➖           | ➖                | ✅     |
| gpt-3.5-turbo-0613         | ✅               | ✅         | ➖           | ➖           | ✅                | ✅     |
| gpt-3.5-turbo-1106         | ✅               | ✅         | ✅           | ➖           | ✅                | ✅     |
| gpt-3.5-turbo-0125         | ✅               | ✅         | ✅           | ➖           | ✅                | ✅     |
| gpt-3.5-turbo-16k-0613     | ✅               | ✅         | ➖           | ➖           | ➖                | ✅     |
| o3-mini                    | ✅               | ✅         | ✅           | ➖           | ✅                | ✅     |
| o1-mini                    | ✅               | ➖         | ➖           | ➖           | ➖                | ✅     |
| o1-mini-2024-09-12         | ✅               | ➖         | ➖           | ➖           | ➖                | ✅     |
| o1-preview                 | ✅               | ➖         | ➖           | ➖           | ➖                | ✅     |
| o1-preview-2024-09-12      | ✅               | ➖         | ➖           | ➖           | ➖                | ✅     |

### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |
<!-- end compatibility -->

## Additional Resources

* [OpenAI Documentation](https://platform.openai.com/docs/overview)
