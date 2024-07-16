const dotenv = require('dotenv')

const { TokenJS } = require('../dist/index.cjs')

dotenv.config()

const testCall = async () => {
  const tokenjs = new TokenJS()
  const result = await tokenjs.chat.completions.create({
    // stream: true,
    provider: 'openai',
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Tell me a joke about the moon.`,
      },
    ],
  })

  console.log(result.choices)
}

testCall()
