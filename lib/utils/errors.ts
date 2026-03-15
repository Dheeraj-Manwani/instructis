/**
 * Base application error. All custom errors extend this.
 * catchAsync maps these to appropriate ApiResponse (e.g. 404, 403).
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to perform this action") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    public readonly details?: unknown
  ) {
    super(message, 400);
    this.name = "ValidationError";
  }
}
