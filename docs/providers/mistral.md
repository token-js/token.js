# Mistral

### Usage

{% code title=".env" %}
```bash
MISTRAL_API_KEY=
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
  provider: 'mistral',
  model: 'mistral-large-2402',
  messages,
})
```

### Supported Models

| Model                   | JSON Output | Tools | Image Input | Streaming | N > 1 |
| ----------------------- | ----------- | ----- | ----------- | --------- | ----- |
| open-mistral-7b         |             |       |             |           |       |
| mistral-tiny-2312       |             |       |             |           |       |
| open-mixtral-8x7b       |             |       |             |           |       |
| mistral-small-2312      |             |       |             |           |       |
| open-mixtral-8x22b      |             |       |             |           |       |
| open-mixtral-8x22b-2404 |             |       |             |           |       |
| mistral-small-latest    |             |       |             |           |       |
| mistral-small-2402      |             |       |             |           |       |
| mistral-medium-latest   |             |       |             |           |       |
| mistral-medium-2312     |             |       |             |           |       |
| mistral-large-latest    |             |       |             |           |       |
| mistral-large-2402      |             |       |             |           |       |
| codestral-latest        |             |       |             |           |       |
| codestral-2405          |             |       |             |           |       |



### Provider Documentation

[https://docs.mistral.ai](https://docs.mistral.ai)
