import { models } from '../../src/models'

/**
 * Models to use in manual tests. We include one model for each provider unless the provider hosts
 * models from multiple sources, in which case we include one model for each source. For example,
 * AWS Bedrock hosts models from five different sources (e.g. Anthropic, Cohere, etc), so we include
 * one model from each of these sources.
 */
export const SELECTED_TEST_MODELS: {
  [K in keyof typeof models]: string[]
} = {
  openai: ['gpt-4o'],
  ai21: ['jamba-instruct'],
  anthropic: ['claude-3-5-sonnet-20240620'],
  gemini: ['gemini-1.5-pro'],
  cohere: ['command-r-plus'],
  bedrock: [
    'amazon.titan-text-express-v1',
    'anthropic.claude-3-sonnet-20240229-v1:0',
    'cohere.command-r-plus-v1:0',
    'meta.llama3-8b-instruct-v1:0',
    'mistral.mistral-7b-instruct-v0:2',
  ],
  mistral: ['open-mistral-7b'],
  groq: ['llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  perplexity: ['llama-3-sonar-small-32k-chat', 'mixtral-8x7b-instruct'],
}
