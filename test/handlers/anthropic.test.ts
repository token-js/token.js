import { describe, it, expect } from 'vitest';
import { convertMessages } from '../../src/handlers/anthropic';
import { CompletionParams } from '../../src/chat';

describe('convertMessages', () => {
  it('converts user and system messages into a block with system messages prefixed', () => {
    const input: CompletionParams['messages'] = [
      { role: 'user', content: 'Hi' },
      { role: 'system', content: 'Bye' }
    ];
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Hi' }, { type: 'text', text: 'System: Bye' }] }
    ];
    expect(convertMessages(input)).toEqual(output);
  });

  it('converts alternating user and assistant messages into blocks', () => {
    const input: CompletionParams['messages'] = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Yo' },
      { role: 'user', content: 'Bye' }
    ];
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Hi' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Yo' }] },
      { role: 'user', content: [{ type: 'text', text: 'Bye' }] }
    ];
    expect(convertMessages(input)).toEqual(output);
  });

  it('prepends an empty user message when the input messages start with an assistant message', () => {
    const input: CompletionParams['messages'] = [
      { role: 'assistant', content: 'Yo' },
      { role: 'user', content: 'Bye' }
    ];
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'Empty' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Yo' }] },
      { role: 'user', content: [{ type: 'text', text: 'Bye' }] },
    ];
    expect(convertMessages(input)).toEqual(output);
  });

  it('does not prepend a user message when the input messages start with a system message', () => {
    const input: CompletionParams['messages'] = [
      { role: 'system', content: 'Hello' },
      { role: 'user', content: 'Hi' }
    ];
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'System: Hello' }, { type: 'text', text: 'Hi' }] }
    ];
    expect(convertMessages(input)).toEqual(output);
  });

  it('groups consecutive system messages into a single user message', () => {
    const input: CompletionParams['messages'] = [
      { role: 'system', content: 'Hello' },
      { role: 'system', content: 'World' },
      { role: 'user', content: 'Hi' }
    ];
    const output = [
      { role: 'user', content: [{ type: 'text', text: 'System: Hello' }, { type: 'text', text: 'System: World' }, { type: 'text', text: 'Hi' }] }
    ];
    expect(convertMessages(input)).toEqual(output);
  });
});