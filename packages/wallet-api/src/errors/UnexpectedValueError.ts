export class UnexpectedValueError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UnexpectedValueError';
    Object.setPrototypeOf(this, UnexpectedValueError.prototype);
  }
}
