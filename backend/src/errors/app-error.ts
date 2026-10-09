/**
 * Application error with a controlled HTTP status code.
 *
 * Used for expected business errors such as:
 * - Duplicate email
 * - Unauthorized access
 * - Forbidden actions
 * - Resource not found
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);

    this.name = "AppError";
  }
}