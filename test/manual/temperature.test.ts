import { describe, expect, it } from 'vitest'

import { TokenJS } from '../../src'
import { models } from '../../src/models'
import { getDummyMessages } from '../dummy'
import { SELECTED_TEST_MODELS } from './constants'

describe('Max Temperature', () => {
  // Ensures that our max temperature isn't too high.
  it('succeeds for the max temperature', async () => {
    const tokenjs = new TokenJS()
    const promises: Array<Promise<void>> = []

    for (const [provider, modelArray] of Object.entries(SELECTED_TEST_MODELS)) {
      for (const modelName of modelArray) {
        const promise = (async () => {
          try {
            const result = await tokenjs.chat.completions.create({
              provider: provider as keyof typeof models,
              model: modelName as any,
              messages: getDummyMessages(),
              temperature: 2,
            })
            expect(result.choices[0].finish_reason).toEqual('stop')
          } catch (error) {
            console.error(
              `Error for provider ${provider} and model ${modelName}`,
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
