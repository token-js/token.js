import { describe, expect, it } from 'vitest'

import { TokenJS } from '../../src'
import { models } from '../../src/models'

describe('Image Message', () => {
  it('succeeds for a message with an image url', async () => {
    const tokenjs = new TokenJS()
    const promises: Array<Promise<void>> = []

    for (const provider of Object.keys(models)) {
      if (models[provider].supportsImages.length > 0) {
        const model = models[provider].supportsImages[0]
        const promise = (async () => {
          try {
            const result = await tokenjs.chat.completions.create({
              provider: provider as keyof typeof models,
              model,
              messages: [
                {
                  role: 'user',
                  content: `What is the animal in the picture? Respond with a single word.`,
                },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'image_url',
                      image_url: {
                        // Image of a cat
                        url: 'https://media.4-paws.org/b/8/8/0/b8805ed707116deaaefe35c6745da0f45615334d/VIER%20PFOTEN_2019-12-13_209-2890x2000-1920x1329.webp',
                      },
                    },
                  ],
                },
              ],
            })
            expect(result.choices[0].finish_reason).toEqual('stop')
            expect(result.choices[0].message.content?.toLowerCase()).toContain(
              'cat'
            )
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
