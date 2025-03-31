export class PetraApiError extends Error {
  constructor(
    readonly code: number,
    readonly status: string,
    message: string
  ) {
    super(message);

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }

    this.status = status;
    this.code = code;
    this.name = 'PetraApiError';
    Object.setPrototypeOf(this, PetraApiError.prototype);
  }

  static INTERNAL_ERROR = new PetraApiError(
    -30001,
    'Internal Error',
    'Internal Error'
  );

  static NO_ACCOUNTS = new PetraApiError(
    4000,
    'No Accounts',
    'No accounts found'
  );

  static TIMEOUT = new PetraApiError(
    4002,
    'Time Out',
    'The prompt timed out without a response. This could be because the user did not respond or because a new request was opened.'
  );

  static UNAUTHORIZED = new PetraApiError(
    4100,
    'Unauthorized',
    'The requested method and/or account has not been authorized by the user.'
  );

  static UNSUPPORTED = new PetraApiError(
    4200,
    'Unsupported',
    'The provider does not support the requested method.'
  );

  static USER_REJECTION = new PetraApiError(
    4001,
    'Rejected',
    'The user rejected the request'
  );
}

export function isPetraApiError(error: PetraApiError): error is PetraApiError {
  return (
    error.name === 'PetraApiError' &&
    error.code !== undefined &&
    error.status !== undefined
  );
}
