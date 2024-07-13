# Groq

### Usage

{% code title=".env" %}
```bash
GROQ_API_KEY=
```
{% endcode %}

```typescript
import { TokenJS, ChatCompletionMessageParam } from 'token.js'

// Import and create the token.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result = await tokenjs.chat.completions.create({
  // Specify the target model and provider
  provider: 'groq',
  model: 'llama3-70b-8192',
  messages,
})
```

### [Groq Documentation](https://console.groq.com/docs/quickstart)

<!-- compatibility -->
### Supported Models

| Model              | Completion | Streaming | JSON Output | Image Input | Tools | N > 1 |
| ------------------ | ---------- | --------- | ----------- | ----------- | ----- | ----- |
| llama3-8b-8192     | ✅          |           |             |             |       |       |
| llama3-70b-8192    | ✅          |           | ✅           |             |       |       |
| mixtral-8x7b-32768 | ✅          |           |             |             |       |       |
| gemma-7b-it        | ✅          |           | ✅           |             |       |       |
| gemma2-9b-it       | ✅          |           | ✅           |             |       |       |

