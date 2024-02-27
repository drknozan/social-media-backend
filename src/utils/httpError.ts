/* eslint-disable @typescript-eslint/no-explicit-any */
class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, public readonly message: string | any) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default HttpError;
