import { NextRequest } from "next/server";
import { ApiResponse } from "./api-response";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

type RouteContext = { params?: Promise<Record<string, string>> };

type RouteHandler = (
  req: NextRequest,
  context: RouteContext
) => Promise<Response> | Response;

/**
 * Wraps a route handler to catch thrown errors and map them to ApiResponse.
 * Use for all API route handlers; do not use try/catch inside routes.
 */
export function catchAsync(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context: RouteContext): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return ApiResponse.unauthorized(err.message);
      }
      if (err instanceof ForbiddenError) {
        return ApiResponse.forbidden(err.message);
      }
      if (err instanceof NotFoundError) {
        return ApiResponse.notFound(err.message);
      }
      if (err instanceof ValidationError) {
        return ApiResponse.error(err.message, 400);
      }
      if (err instanceof AppError) {
        return ApiResponse.error(err.message, err.statusCode);
      }
      // Unknown errors: log and return 500
      console.error(err);
      return ApiResponse.error("Internal server error", 500);
    }
  };
}
