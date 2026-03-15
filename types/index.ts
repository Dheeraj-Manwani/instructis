/**
 * Global TypeScript types for the application.
 * Prefer domain types here; infer API types from Zod schemas where possible.
 */

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};
