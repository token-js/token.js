# Cohere

### Usage

{% code title=".env" %}
```bash
COHERE_API_KEY=
```
{% endcode %}

```typescript
import { TokenJS, ChatCompletionMessageParam } from 'llmjs'

// Import and create the LLM.js client
const tokenjs = new TokenJS()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await llm.chat.completions.create({
  // Specify the target model and provider
  provider: 'cohere',
  model: 'command-r',
  messages,
})
```

### Supported Models

| Model                 | JSON Output | Tools | Image Input | Streaming | N > 1 |
| --------------------- | ----------- | ----- | ----------- | --------- | ----- |
| command-r-plus        |             |       |             |           |       |
| command-r             |             |       |             |           |       |
| command               |             |       |             |           |       |
| command-nightly       |             |       |             |           |       |
| command-light         |             |       |             |           |       |
| command-light-nightly |             |       |             |           |       |



### Provider Documentation

[https://docs.cohere.com](https://docs.cohere.com)
