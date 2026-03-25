# Project Structure (Instructis)

This document explains the folder structure of this Next.js (App Router) project and the responsibility of each major file/folder. It also calls out the key areas added for the landing-page carousels and the `CallbackRequest` flow.

## High-level Architecture

This codebase is split into layers:

- **HTTP/API layer**: Next.js route handlers (`app/api/.../route.ts`)
- **Business logic layer**: `services/*.service.ts` (no Prisma, no Next.js APIs)
- **Data access layer**: `repositories/*.repository.ts` (Prisma queries only)
- **Validation/Infrastructure**: `lib/*` (Prisma client, auth helpers, Zod schemas, middleware, API response helpers)
- **UI layer**: `app/*` pages/layouts + `components/*`

## Key Folders

### `app/`

Next.js App Router pages, layouts, and API routes.

- `app/page.tsx`
  - Landing page (client component).
  - Mounts the landing top carousel, “Meet our stars”, testimonials, the “Request a callback” section, and the footer.
  - Contains the `CallbackRequestSection` UI (2-step form) which submits to the API.
- `app/(main)/layout.tsx`
  - Protects dashboard area via session; wraps pages with `components/DashboardLayout`.
- `app/(main)/admin/...`
  - Admin pages for managing resources.
  - Example added for this request: `app/(main)/admin/callback-requests/page.tsx`.
- `app/api/v1/*/route.ts` and `app/api/v1/*/[id]/route.ts`
  - Versioned API route handlers.
  - Must be thin: authenticate/authorize, validate, then delegate to the corresponding service.
  - Added for this request:
    - `app/api/v1/callback-requests/route.ts` (`GET` list for admin, `POST` public create)
    - `app/api/v1/callback-requests/[id]/route.ts` (`PATCH` admin update status)

Other app routes (dashboard features, auth pages, etc.) follow the same App Router conventions.

### `components/`

React components used by pages.

Notable additions for the landing page:

- `components/TopResultsCarousel.tsx`
  - Swiper-based “Results that matter” carousel (top banner).
- `components/MeetOurStarsCarousel.tsx`
  - Swiper-based carousel with filter buttons (`ALL`, `NEET`, `JEE`, `CLASSES 6-10`) for “Meet our stars”.
- `components/TestimonialsCarousel.tsx`
  - Swiper-based testimonials carousel.
- `components/CallbackFloatingPhoneButton.tsx`
  - Bottom-right floating phone button that scrolls to the callback section (`#callback`).

Shared UI/layout:

- `components/DashboardLayout.tsx`
  - Sidebar + topbar layout for authenticated app.
- `components/ui/*`
  - Reusable UI primitives (Button, Card, Table, Select, etc.).

### `lib/`

Infrastructure, shared utilities, and the front-end API client.

- `lib/prisma.ts`
  - Prisma client instance used by repositories.
- `lib/auth.ts`, `lib/get-session.ts`, `lib/auth-client.ts`
  - Auth helpers (Better Auth integration).
- `lib/middlewares/*`
  - Route middlewares:
    - `withAuth.ts` (session required)
    - `withRole.ts` (role/permission gate)
    - `withValidation.ts` (Zod request body validation)
    - `withRateLimit.ts` (simple placeholder rate-limit)
    - `middlewares/index.ts` (export barrel)
- `lib/utils/*`
  - `api-response.ts`: standardized JSON responses (`ApiResponse.success/created/error/...`)
  - `catchAsync.ts`: wraps route handlers and maps thrown `AppError` subclasses
  - `errors.ts`: `AppError`, `UnauthorizedError`, `ForbiddenError`, etc.
  - Other helpers (animations, test import helpers, etc.)
- `lib/api/*` (client-side axios helpers)
  - Typed wrappers around `api` axios instance (base `/api/v1`).
  - Example for this request:
    - `lib/api/callback-requests.ts` (`fetchCallbackRequests`, `createCallbackRequest`, `updateCallbackRequestStatus`)
- `lib/schemas/*`
  - Zod schemas used by middlewares in API routes.
  - Example added:
    - `lib/schemas/callback-request.schema.ts`
- `lib/validations/*`
  - Additional/legacy Zod schemas used by some existing areas.
  - Example existing file:
    - `lib/validations/ai-rank.schema.ts`

### `services/`

Business logic only.

- `services/*.service.ts`
  - Orchestrates operations and calls repositories.
  - Does not import Prisma directly.
  - Added for this request:
    - `services/callback-request.service.ts`
      - `createCallbackRequest`
      - `listCallbackRequests`
      - `updateCallbackRequestStatus` (sets `calledAt` when status transitions to `CALLED`)

### `repositories/`

Prisma data access layer only.

- `repositories/*.repository.ts`
  - Contains Prisma queries/mutations.
  - Added for this request:
    - `repositories/callback-request.repository.ts`
      - `createCallbackRequest`
      - `findManyCallbackRequests` (with status filter)
      - `getCallbackRequestByIdOrThrow`
      - `updateCallbackRequestStatus`

### `types/`

Global TypeScript types shared across the app.

- `types/index.ts`
  - `PaginationMeta`
  - `PaginatedResponse<T>`

### `prisma/`

Prisma schema and migrations.

- `prisma/schema.prisma`
  - Datamodels and enums.
  - Contains:
    - `model CallbackRequest`
    - `enum CallbackStatus`
    - `enum CourseMode`
    - `enum ExamType`
- `prisma/migrations/*`
  - Migration history.
- `prisma/seed*.ts`
  - Seed scripts.

### `docs/`

Extra documentation.

- `docs/ai-rank-prediction.md`
  - Explains AI rank prediction logic.

## Notes Specific to This Project

1. **API endpoints are under `/api/v1`**.
2. **Route handlers are intentionally thin**:
   - `route.ts` authenticates/authorizes (via `withAuth`, `withRole`),
   - validates with `withValidation`,
   - then delegates to `services/*`.
3. **Schemas live in `lib/schemas`** for the majority of routes (and `lib/validations` for some existing ones).

