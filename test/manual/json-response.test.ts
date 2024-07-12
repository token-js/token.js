import { describe, expect, it } from 'vitest'

import { TokenJS } from '../../src'
import { models } from '../../src/models'

describe('JSON Response Type', () => {
  it('returns valid json with at least one key', async () => {
    const tokenjs = new TokenJS()
    const promises: Array<Promise<void>> = []

    for (const provider of Object.keys(models)) {
      if (models[provider].supportsJSON.length > 0) {
        const model = models[provider].supportsJSON[0]
        console.log(model)
        const promise = (async () => {
          try {
            const result = await tokenjs.chat.completions.create({
              response_format: { type: 'json_object' },
              provider: provider as keyof typeof models,
              model: model as any,
              messages: [
                {
                  role: 'user',
                  content: 'Generate a JSON that maps Earth to its mass',
                },
              ],
            })
            expect(result.choices[0].finish_reason).toEqual('stop')
            const json = result.choices[0].message.content
            expect(typeof json === 'string').toEqual(true)
            const parsed = JSON.parse(json!)
            console.log(parsed)
            expect(Object.keys(parsed).length).toBeGreaterThan(0)
          } catch (error) {
            console.error(
              `Error for provider ${provider} and model ${model}`,
              error
            )
            throw error
          }
        })()

        promises.push(promise)
      }
    }

    await Promise.all(promises)
  })
})
