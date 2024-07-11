# Groq

### Usage

{% code title=".env" %}
```bash
GROQ_API_KEY=
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
  provider: 'groq',
  model: 'llama3-70b-8192',
  messages,
})
```

### Supported Models

<table><thead><tr><th width="192">Model</th><th>JSON Output</th><th>Tools</th><th>Image Input</th><th>Streaming</th><th>N > 1</th></tr></thead><tbody><tr><td>llama3-8b-8192</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>llama3-70b-8192</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>mixtral-8x7b-32768</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>gemma-7b-it</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>gemma2-9b-it</td><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>



### Provider Documentation

[https://console.groq.com/docs/quickstart](https://console.groq.com/docs/quickstart)
