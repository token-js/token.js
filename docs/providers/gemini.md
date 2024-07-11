# Gemini

### Usage

{% code title=".env" %}
```bash
GEMINI_API_KEY=
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
  provider: 'gemini',
  model: 'gemini-1.5-pro',
  messages,
})
```

### Supported Models

| Model            | JSON Output | Tools | Image Input | Streaming | N > 1 |
| ---------------- | ----------- | ----- | ----------- | --------- | ----- |
| gemini-1.5-pro   |             |       |             |           |       |
| gemini-1.5-flash |             |       |             |           |       |
| gemini-1.0-pro   |             |       |             |           |       |



### Provider Documentation

[https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
