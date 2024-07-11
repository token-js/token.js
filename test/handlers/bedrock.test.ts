import { describe, expect, it } from 'vitest'

import { convertToolParams } from '../../src/handlers/bedrock'
import { getDummyTool } from '../dummy'

describe('convertToolParams', () => {
  it(`returns undefined when 'tool_choice' is 'none'`, () => {
    expect(convertToolParams('none', [getDummyTool()])).toEqual(undefined)
  })
})
