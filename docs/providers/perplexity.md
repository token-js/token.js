# Perplexity

### Usage

{% code title=".env" %}
```bash
PERPLEXITY_API_KEY=
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
  provider: 'perplexity',
  model: 'llama-3-70b-instruct',
  messages,
})
```

### Supported Models

| Model                          | JSON Output | Tools | Image Input | Streaming | N > 1 |
| ------------------------------ | ----------- | ----- | ----------- | --------- | ----- |
| llama-3-sonar-small-32k-chat   |             |       |             |           |       |
| llama-3-sonar-small-32k-online |             |       |             |           |       |
| llama-3-sonar-large-32k-chat   |             |       |             |           |       |
| llama-3-sonar-large-32k-online |             |       |             |           |       |
| llama-3-8b-instruct            |             |       |             |           |       |
| llama-3-70b-instruct           |             |       |             |           |       |
| mixtral-8x7b-instruct          |             |       |             |           |       |



### Provider Documentation

[https://docs.anthropic.com/en/docs/welcome](https://docs.anthropic.com/en/docs/welcome)
