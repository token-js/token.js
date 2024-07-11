# Anthropic

### Usage

{% code title=".env" %}
```bash
ANTHROPIC_API_KEY=
```
{% endcode %}

```typescript
import { LLM, ChatCompletionMessageParam } from 'llmjs'

// Import and create the LLM.js client
const llm = new LLM()

// Specify OpenAI compatible messages
const messages: ChatCompletionMessageParam = [{
  role: 'user',
  content: `How are you?`,
}]

// Call the create function
const result: ChatCompletionMessageParam[] = await llm.chat.completions.create({
  // Specify the target model and provider
  provider: 'anthropic',
  model: 'claude-2.0',
  messages,
})
```

### Supported Models

| Model                      | JSON Output | Tools | Image Input | Streaming | N > 1 |
| -------------------------- | ----------- | ----- | ----------- | --------- | ----- |
| claude-3-5-sonnet-20240620 |             |       |             |           |       |
| claude-3-opus-20240229     |             |       |             |           |       |
| claude-3-sonnet-20240229   |             |       |             |           |       |
| claude-3-haiku-20240307    |             |       |             |           |       |
| claude-2.1                 |             |       |             |           |       |
| claude-2.0                 |             |       |             |           |       |
| claude-instant-1.2         |             |       |             |           |       |



### Provider Documentation

[https://docs.anthropic.com/en/docs/welcome](https://docs.anthropic.com/en/docs/welcome)