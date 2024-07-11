# OpenAI

### Usage

{% code title=".env" %}
```bash
OPENAI_API_KEY=
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
  provider: 'openai',
  model: 'gpt-4o',
  messages,
})
```

### Supported Models

| Model                  | JSON Output | Tools | Image Input | Streaming | N > 1 |
| ---------------------- | ----------- | ----- | ----------- | --------- | ----- |
| gpt-4o                 |             |       |             |           |       |
| gpt-4o-2024-05-13      |             |       |             |           |       |
| gpt-4-turbo            |             |       |             |           |       |
| gpt-4-turbo-2024-04-09 |             |       |             |           |       |
| gpt-4-0125-preview     |             |       |             |           |       |
| gpt-4-turbo-preview    |             |       |             |           |       |
| gpt-4-1106-preview     |             |       |             |           |       |
| gpt-4-vision-preview   |             |       |             |           |       |
| gpt-4                  |             |       |             |           |       |
| gpt-4-0314             |             |       |             |           |       |
| gpt-4-0613             |             |       |             |           |       |
| gpt-4-32k              |             |       |             |           |       |
| gpt-4-32k-0314         |             |       |             |           |       |
| gpt-4-32k-0613         |             |       |             |           |       |
| gpt-3.5-turbo          |             |       |             |           |       |
| gpt-3.5-turbo-16k      |             |       |             |           |       |
| gpt-3.5-turbo-0301     |             |       |             |           |       |
| gpt-3.5-turbo-0613     |             |       |             |           |       |
| gpt-3.5-turbo-1106     |             |       |             |           |       |
| gpt-3.5-turbo-0125     |             |       |             |           |       |
| gpt-3.5-turbo-16k-0613 |             |       |             |           |       |



### Provider Documentation

[https://docs.anthropic.com/en/docs/welcome](https://docs.anthropic.com/en/docs/welcome)
