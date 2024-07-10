import { describe, expect, it } from 'vitest'

import { CompletionParams } from '../../src/chat'
import { convertMessages } from '../../src/handlers/anthropic'

describe('convertMessages', () => {
  it('converts user and system messages into a block with system messages prefixed', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'user', content: 'Hi' },
      { role: 'system', content: 'Bye' },
    ]
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Hi' }, { type: 'text', text: 'System: Bye' }] }
    ];
    expect(await convertMessages(input)).toEqual(output);
  });

  it('converts alternating user and assistant messages into blocks', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Yo' },
      { role: 'user', content: 'Bye' },
    ]
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Yo' }] },
      { role: 'user', content: [{ type: 'text', text: 'Bye' }] }
    ];
    expect(await convertMessages(input)).toEqual(output);
  });

  it('prepends an empty user message when the input messages start with an assistant message', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'assistant', content: 'Yo' },
      { role: 'user', content: 'Bye' },
    ]
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Empty' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Yo' }] },
      { role: 'user', content: [{ type: 'text', text: 'Bye' }] },
    ];
    expect(await convertMessages(input)).toEqual(output);
  });

  it('does not prepend a user message when the input messages start with a system message', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'system', content: 'Hello' },
      { role: 'user', content: 'Hi' },
    ]
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'System: Hello' }, { type: 'text', text: 'Hi' }] }
    ];
    expect(await convertMessages(input)).toEqual(output);
  });

  it('groups consecutive system messages into a single user message', async () => {
    const input: CompletionParams['messages'] = [
      { role: 'system', content: 'Hello' },
      { role: 'system', content: 'World' },
      { role: 'user', content: 'Hi' },
    ]
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'System: Hello' }, { type: 'text', text: 'System: World' }, { type: 'text', text: 'Hi' }] }
    ];
    expect(await convertMessages(input)).toEqual(output);
  });
});

describe('convertToolParams', () => {
  it(`returns undefined when 'tool_choice' is 'none'`, () => {
    expect(convertToolParams('none', [getDummyTool()])).toEqual({toolChoice: undefined, tools: undefined})
  })
})
