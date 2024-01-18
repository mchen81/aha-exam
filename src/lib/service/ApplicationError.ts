/**
 * @fileoverview An Application Error is a user-level error that the message is visible to the end user.
 */

class ApplicationError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

export default ApplicationError;
