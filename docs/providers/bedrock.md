# Bedrock

### Usage

{% code title=".env" %}
```bash
AWS_REGION_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
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
  provider: 'bedrock',
  model: 'amazon.titan-text-express-v1',
  messages,
})
```

### Supported Models

| Model                                   | JSON Output | Tools | Image Input | Streaming | N > 1 |
| --------------------------------------- | ----------- | ----- | ----------- | --------- | ----- |
| amazon.titan-text-lite-v1               |             |       |             |           |       |
| amazon.titan-text-express-v1            |             |       |             |           |       |
| anthropic.claude-3-opus-20240229-v1:0   |             |       |             |           |       |
| anthropic.claude-3-sonnet-20240229-v1:0 |             |       |             |           |       |
| anthropic.claude-3-haiku-20240307-v1:0  |             |       |             |           |       |
| anthropic.claude-v2:1                   |             |       |             |           |       |
| anthropic.claude-v2                     |             |       |             |           |       |
| anthropic.claude-instant-v1             |             |       |             |           |       |
| cohere.command-r-plus-v1:0              |             |       |             |           |       |
| cohere.command-r-v1:0                   |             |       |             |           |       |
| cohere.command-text-v14                 |             |       |             |           |       |
| cohere.command-light-text-v14           |             |       |             |           |       |
| meta.llama3-8b-instruct-v1:0            |             |       |             |           |       |
| meta.llama3-70b-instruct-v1:0           |             |       |             |           |       |
| meta.llama2-13b-chat-v1                 |             |       |             |           |       |
| meta.llama2-70b-chat-v1                 |             |       |             |           |       |
| mistral.mistral-7b-instruct-v0:2        |             |       |             |           |       |
| mistral.mixtral-8x7b-instruct-v0:1      |             |       |             |           |       |
| mistral.mistral-large-2402-v1:0         |             |       |             |           |       |



### Provider Documentation

[https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html](https://docs.aws.amazon.com/bedrock/latest/APIReference/welcome.html)
