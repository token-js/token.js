# AWS Bedrock

[Get AWS credentials](https://aws.amazon.com/console/)

## Usage

{% code title=".env" %}
```bash
AWS_REGION_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```
{% endcode %}

```typescript
import { TokenJS } from 'token.js'

// Create the Token.js client
const tokenjs = new TokenJS()

async function main() {
  // Create a model response
  const completion = await tokenjs.chat.completions.create({
    // Specify the provider and model
    provider: 'bedrock',
    model: 'meta.llama3-70b-instruct-v1:0',
    // Define your message
    messages: [
      {
        role: 'user',
        content: 'Hello!',
      },
    ],
  })
  console.log(completion.choices[0])
}
main()
```

<!-- compatibility -->
## Supported Models

| Model                                   | Chat Completion | Streaming | JSON Output | Image Input | Function Calling | N > 1 |
| --------------------------------------- | --------------- | --------- | ----------- | ----------- | ---------------- | ----- |
| amazon.titan-text-lite-v1               | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| amazon.titan-text-express-v1            | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| anthropic.claude-3-opus-20240229-v1:0   | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| anthropic.claude-3-sonnet-20240229-v1:0 | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| anthropic.claude-3-haiku-20240307-v1:0  | ✅               | ✅         | ➖           | ✅           | ✅                | ➖     |
| anthropic.claude-v2:1                   | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| anthropic.claude-v2                     | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| anthropic.claude-instant-v1             | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| cohere.command-r-plus-v1:0              | ✅               | ✅         | ➖           | ➖           | ✅                | ➖     |
| cohere.command-r-v1:0                   | ✅               | ✅         | ➖           | ➖           | ✅                | ➖     |
| cohere.command-text-v14                 | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| cohere.command-light-text-v14           | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| meta.llama3-8b-instruct-v1:0            | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| meta.llama3-70b-instruct-v1:0           | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| meta.llama2-13b-chat-v1                 | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| meta.llama2-70b-chat-v1                 | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| mistral.mistral-7b-instruct-v0:2        | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| mistral.mixtral-8x7b-instruct-v0:1      | ✅               | ✅         | ➖           | ➖           | ➖                | ➖     |
| mistral.mistral-large-2402-v1:0         | ✅               | ✅         | ➖           | ➖           | ✅                | ➖     |

### Legend
| Symbol             | Description                           |
|--------------------|---------------------------------------|
| :white_check_mark: | Supported by Token.js                 |
| :heavy_minus_sign: | Not supported by the LLM provider, so Token.js cannot support it     |
<!-- end compatibility -->

## Additional Resources

* [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
