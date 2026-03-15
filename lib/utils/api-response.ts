import { NextResponse } from "next/server";

type Meta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  [key: string]: unknown;
};

/**
 * Standardised API response helper. Use this for all route handlers; never return raw Response.json.
 */
export const ApiResponse = {
  success<T>(data: T, message?: string, meta?: Meta) {
    return NextResponse.json(
      { success: true, data, ...(message && { message }), ...(meta && { meta }) },
      { status: 200 }
    );
  },

  created<T>(data: T, message?: string) {
    return NextResponse.json(
      { success: true, data, ...(message && { message }) },
      { status: 201 }
    );
  },

  error(message: string, status: number = 400) {
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  },

  unauthorized(message: string = "Unauthorized") {
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  },

  forbidden(message: string = "Forbidden") {
    return NextResponse.json(
      { success: false, error: message },
      { status: 403 }
    );
  },

  notFound(message: string = "Not found") {
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 }
    );
  },
};
