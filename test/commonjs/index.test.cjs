const { expect } = require('@jest/globals');
const { TokenJS } = require('../../dist/index.cjs');

describe('Does work with CommonJS', () => {
  it('throws an error for a number greater than the max temperature', async () => {
    const tokenjs = new TokenJS()
    await expect(
      tokenjs.chat.completions.create({
        provider: 'openai',
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'dummyMessage' }],
        temperature: 2.1,
      })
    ).rejects.toThrow()
  })
});