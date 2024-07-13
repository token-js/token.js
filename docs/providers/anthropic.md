# Anthropic

### Usage

{% code title=".env" %}
```bash
ANTHROPIC_API_KEY=
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
  provider: 'anthropic',
  model: 'claude-2.0',
  messages,
})
```

### [Anthropic Documentation](https://docs.anthropic.com/en/docs/welcome)

<!-- compatibility -->
### Supported Models

| Model                      | Completion | Streaming | JSON Output | Image Input | Tools | N > 1 |
| -------------------------- | ---------- | --------- | ----------- | ----------- | ----- | ----- |
| claude-3-5-sonnet-20240620 | ✅          |           |             | ✅           | ✅     |       |
| claude-3-opus-20240229     | ✅          |           |             | ✅           | ✅     |       |
| claude-3-sonnet-20240229   | ✅          |           |             | ✅           | ✅     |       |
| claude-3-haiku-20240307    | ✅          |           |             | ✅           | ✅     |       |
| claude-2.1                 | ✅          |           |             |             |       |       |
| claude-2.0                 | ✅          |           |             |             |       |       |
| claude-instant-1.2         | ✅          |           |             |             |       |       |

