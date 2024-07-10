export type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | 'function'
export type MIMEType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

export class InputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class InvariantError extends Error {
  constructor(message: string) {
    super(
      `${message}\n` +
        `Should never happen. Please report this error to the developers.`
    )
    this.name = 'InvariantError'
    Error.captureStackTrace(this, this.constructor)
  }
}
