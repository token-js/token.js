# Gemini

### Usage

{% code title=".env" %}
```bash
GEMINI_API_KEY=
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
  provider: 'gemini',
  model: 'gemini-1.5-pro',
  messages,
})
```

### [Gemini Documentation](https://ai.google.dev/gemini-api/docs)

<!-- compatibility -->
### Supported Models

| Model            | Completion | Streaming | JSON Output | Image Input | Tools | N > 1 |
| ---------------- | ---------- | --------- | ----------- | ----------- | ----- | ----- |
| gemini-1.5-pro   | ✅          |           | ✅           | ✅           | ✅     | ✅     |
| gemini-1.5-flash | ✅          |           | ✅           | ✅           | ✅     | ✅     |
| gemini-1.0-pro   | ✅          |           |             |             | ✅     | ✅     |

