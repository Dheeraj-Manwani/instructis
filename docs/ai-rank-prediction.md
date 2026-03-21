# AI Rank Prediction: End-to-End Technical Documentation

This document describes the current AI rank prediction implementation in Instructis, including:
- architecture and request flow
- backend logic and rank estimation math
- Gemini prompt contracts and fallback behavior
- database models/columns used
- API contracts
- frontend behavior (student and faculty/admin predictor flows)

---

## 1) Feature Scope

The codebase currently has **two AI rank flows**:

1. **Student self-serve predictor (primary/new)**
   - API: `/api/v1/student-rank-predictor`
   - UI: `app/(main)/ai-rank-predictor/page.tsx`
   - Sidebar entry for students: `AI Rank Predictor`
   - Uses:
     - marks history
     - latest percentile by exam type
     - weak areas
     - prior stored predictions
     - target exam from student profile
   - Stores structured Gemini output in DB (`RankPrediction.predictionJson`) for reuse.

2. **Faculty/Admin analyze + notify flow (existing/legacy)**
   - API: `/api/v1/ai-rank` and `/api/v1/ai-rank/notify`
   - UI: `app/(main)/predicter/page.tsx`
   - Batch+student selection, single analysis call, optional parent notification.

---

## 2) High-Level Architecture

- **Route layer**
  - `app/api/v1/student-rank-predictor/route.ts`
    - `GET`: fetch latest cached prediction and derived UI payload.
    - `POST`: force fresh Gemini prediction, persist, and return refreshed payload.
  - `app/api/v1/ai-rank/route.ts`
    - faculty/admin analyze endpoint.
  - `app/api/v1/ai-rank/notify/route.ts`
    - faculty/admin parent notification endpoint.

- **Service layer**
  - `services/ai-rank.service.ts`
    - orchestrates query aggregation, Gemini call, derived rank fallback math, persistence, and response shaping.

- **Repository layer**
  - `repositories/ai-rank.repository.ts`
    - Prisma access for `RankPrediction`, student marks/weak areas aggregation, and latest prediction retrieval.

- **AI integration**
  - `lib/ai-gemini.ts`
    - model fallback chain
    - rate-limit retries with exponential backoff
    - strict JSON prompt contracts
    - parse + sanitization + fallback payloads on AI failure

---

## 3) Data Collection Logic (Student Predictor)

Implemented in `getStudentPredictorDataByUserId(userId)` and consumed by service methods.

For logged-in student (`Student` by `userId`), we collect:

- `Student`
  - `id`
  - `targetExam`
  - `user.name`

- `Mark[]` (ordered ascending by `createdAt`)
  - `id`
  - `subject`
  - `testName`
  - `examType`
  - `marksObtained`
  - `maxMarks`
  - `percentile`
  - `improvement`
  - `createdAt`

- `WeakArea[]` (ordered by priority asc, drawback desc)
  - `id`
  - `topicId`
  - `drawbackPoints`
  - `questionsCount`
  - `priority`
  - `topic: { id, name, subject }`

- `RankPrediction[]` (ordered desc by `createdAt`)
  - full row including `predictionJson`

---

## 4) Service Logic

### 4.1 Read Flow (`GET /student-rank-predictor`)

`getStudentRankPredictorByUserId(userId)`:

1. Load aggregated student predictor data.
2. Determine available exam types from marks (`JEE`, `NEET`), fallback to `targetExam` if no marks.
3. Select active exam = `targetExam`.
4. Compute:
   - latest mark in selected exam
   - latest percentile by exam type (`JEE`, `NEET`)
5. Fetch latest stored prediction for:
   - target exam
   - both exam types for side cards
6. Parse `predictionJson` if available.
7. Build response:
   - top stat values
   - trend chart points
   - weak area table rows + per-topic recommendation merge
   - AI card data (rank ranges, target percentile, band estimates, tips, recommendation cards, trend status)
   - per-exam prediction summary
   - last updated timestamp

If no stored prediction exists, API still returns usable base data and `ai: null`.

### 4.2 Refresh Flow (`POST /student-rank-predictor`)

`refreshStudentRankPredictorByUserId(userId)`:

1. Load student data.
2. Reject when no marks: `400 Complete at least one test to generate prediction`.
3. Build Gemini input payload with:
   - student name
   - target exam
   - latest percentiles for JEE/NEET
   - full marks history
   - weak areas
   - up to last 3 previous predictions
4. Call `generateStudentRankPrediction(...)`.
5. Convert Gemini rank range into persisted numeric rank:
   - primary exam = student target exam
   - first try parse low bound from AI range text (`"2500-3400"` => `2500`)
   - fallback to formula estimate if parse fails
6. Persist new `RankPrediction` row with structured JSON.
7. Return final hydrated read payload by re-calling read flow.

### 4.3 Rank Fallback Math

Used when needed:

`rank = max(1, round(((100 - percentile) / 100) * 100000))`

Assumes an approximate cohort size of `100,000` for coarse estimation.

---

## 5) Gemini Integration Details

File: `lib/ai-gemini.ts`

### 5.1 Model Strategy

Model fallback order:
1. `gemini-2.5-flash-lite`
2. `gemini-2.5-flash`
3. `gemini-2.0-flash`

Rationale in code:
- prioritize higher free-tier throughput first.

### 5.2 Retry Strategy

- max retries per model: `3`
- base delay: `3000ms`
- exponential backoff: `3s -> 6s -> 12s` (capped at `20s`)
- honors server-provided `retry in Xs` hints when present

### 5.3 Error Classification

- model not found: triggers immediate fallback to next model
- rate limit / quota: retries, then falls back to next model
- unknown errors: thrown directly

### 5.4 JSON Sanitization

AI output is sanitized to remove code fences:
- strips ```json ... ```
- parses strict JSON

### 5.5 Student Prompt Contract (Current)

Prompt asks model to return exact JSON shape containing:

- `predictedRankRange` (`JEE`, `NEET`)
- `targetPercentileNeeded` (`top1000`, `top3000`)
- `percentileBandRankEstimate` (`p95To99`, `p90To95`)
- `improvementPointsForNextBand` (string array)
- `weakAreaRecommendations` per topic:
  - `topicId`
  - `topicName`
  - `subject`
  - `studyFocus`
  - `practiceQuestionCount`
  - `resourceTypeSuggestion` enum-like string
- `overallImprovementTip`
- `recommendationCards`
  - `practice`
  - `videoOrRevision`
  - `formulaRevision`
- `trendStatus` = one of `improving | stagnant | declining`

### 5.6 Student AI Fallback Payload

If live Gemini output fails/parsing fails:
- returns synthetic, safe default JSON:
  - estimated ranges using percentile formula
  - default target percentiles
  - default band estimates
  - generated weak area recommendations for all weak topics
  - conservative tips and `trendStatus: "stagnant"`

---

## 6) Database Schema and Columns

Primary models used by AI predictor:

### 6.1 `Student`
- `id`
- `userId`
- `targetExam` (`JEE` | `NEET`)
- relations:
  - `marks`
  - `weakAreas`
  - `rankPredictions`

### 6.2 `Mark`
- `id`
- `studentId`
- `subject` (`SubjectEnum`)
- `testName`
- `examType` (`JEE` | `NEET`)
- `marksObtained` (`Float`)
- `maxMarks` (`Float`)
- `percentile` (`Float?`)
- `improvement` (`Float?`)
- `createdAt` (`DateTime`)

### 6.3 `WeakArea`
- `id`
- `studentId`
- `topicId`
- `drawbackPoints` (`Float`)
- `questionsCount` (`Int`)
- `priority` (`HIGH | MEDIUM | LOW`)
- relation:
  - `topic` (`name`, `subject`)

### 6.4 `RankPrediction` (storage for AI outputs)
- `id`
- `studentId`
- `examType`
- `percentile`
- `predictedRank`
- `targetPercentile` (`Float?`)
- `targetRank` (`Int?`)
- `improvementPts` (`Float`)
- `predictionJson` (`Json?`)  <-- stores structured Gemini response
- `createdAt`

### 6.5 Notification Logs (faculty flow)

`WhatsAppLog` stores notify outcomes and metadata for parent notifications.

---

## 7) Repository Persistence Notes

`createRankPrediction(...)` in `repositories/ai-rank.repository.ts`:
- builds a typed Prisma create payload (`RankPredictionUncheckedCreateInput`)
- safely handles nullable JSON:
  - `predictionJson: null` converted to `Prisma.DbNull`
  - non-null JSON passed as `Prisma.InputJsonValue`

This avoids Prisma JSON type assignment issues.

---

## 8) API Contracts

### 8.1 Student Predictor

#### `GET /api/v1/student-rank-predictor`
- Auth: required
- Role: `STUDENT`
- Returns: consolidated predictor payload for rendering cached state

#### `POST /api/v1/student-rank-predictor`
- Auth: required
- Role: `STUDENT`
- Behavior: forces fresh AI run, stores to DB, returns updated payload

### 8.2 Faculty/Admin Predictor

#### `POST /api/v1/ai-rank`
- Auth: required
- Role: `FACULTY` or `ADMIN`
- Body:
  - `batchId`
  - `studentId`
- Returns:
  - rank record + AI summary for selected student

#### `POST /api/v1/ai-rank/notify`
- Auth: required
- Role: `FACULTY` or `ADMIN`
- Body:
  - `batchId`
  - `studentId`
  - `aiSummary`
- Sends WhatsApp (and optionally email), logs status.

---

## 9) Frontend Behavior (Student Screen)

File: `app/(main)/ai-rank-predictor/page.tsx`

- loads via `GET /student-rank-predictor`
- refresh button triggers `POST /student-rank-predictor`
- if refresh fails:
  - keeps previous loaded state
  - shows: "Showing last saved prediction."
- if no prediction and no history:
  - empty state asks student to complete at least one test
- while loading/refreshing:
  - full skeleton + "Gemini is analyzing your performance..."

UI sections implemented:
- header + exam toggle + refresh action
- 4 stat cards
- percentile band with marker
- target rank cards (95-99 and 90-95 bands)
- weak areas table with practice navigation
- AI improvement tip and recommendation cards
- marks/percentile trend chart

---

## 10) Environment and Operational Dependencies

- `GEMINI_API_KEY` is required for live Gemini calls.
- If key missing:
  - Gemini client is not configured
  - code warns via console
  - fallback behavior in generator methods can still provide safe estimates.

---

## 11) Known Functional Nuances

- `predictedRank` persisted for student refresh flow is derived from:
  - parsed lower bound of AI range text when parseable
  - otherwise percentile formula fallback.
- `improvementPts` is currently persisted as `0` in student refresh flow.
- `targetRank` persisted as `1000` and `targetPercentile` from AI `top1000`.
- Stored JSON (`predictionJson`) is the main source for rich UI recommendations.

---

## 12) Key Files

- `app/api/v1/student-rank-predictor/route.ts`
- `services/ai-rank.service.ts`
- `repositories/ai-rank.repository.ts`
- `lib/ai-gemini.ts`
- `app/(main)/ai-rank-predictor/page.tsx`
- `app/api/v1/ai-rank/route.ts`
- `app/api/v1/ai-rank/notify/route.ts`
- `prisma/schema.prisma`

