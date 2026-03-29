# Class Schedule and Attendance: End-to-End Implementation

This document explains the current implementation of class scheduling and attendance, including:

- data model and relationships (faculty, student, batch, class session, attendance)
- backend flow (route -> service -> repository -> Prisma)
- frontend flow (API clients -> pages/components -> rendered UI)
- how data is displayed for faculty and students

---

## 1) Core Data Model and Relationships

The implementation is centered around these Prisma models:

- `User` -> has one optional `Faculty` profile and one optional `Student` profile
- `Batch` -> groups students and faculties
- `BatchFaculty` -> join table (`batchId`, `facultyId`) mapping many-to-many between batches and faculties
- `Student` -> belongs to one optional `Batch` via `batchId`
- `ClassSession` -> scheduled class owned by one `Faculty` for one `Batch`
- `Attendance` -> per-student presence for one class session

### Relationship Summary

1. A faculty can teach multiple class sessions.
2. A batch can have many students.
3. A batch can have many faculties (through `BatchFaculty`).
4. A class session belongs to exactly one batch and one faculty.
5. Attendance is one record per student per class session (enforced by unique constraint).

### Key constraints in schema

- `Attendance` has `@@unique([studentId, classSessionId])`, so duplicate attendance entries for same student/session are not possible.
- `Student.batchId` links students to their current batch.
- `ClassSession` stores schedule and teaching metadata:
  - `subject`, `title`, `topic`, `description`
  - `date`, `startTime`, `endTime`
  - `meetLink`
  - status lifecycle: `SCHEDULED`, `LIVE`, `COMPLETED`, `CANCELLED`

---

## 2) Backend Architecture (Current Pattern)

The code follows layered flow:

1. **Route handlers** (`app/api/.../route.ts`)
2. **Service layer** (`services/*.service.ts`) for validation/authorization/business rules
3. **Repository layer** (`repositories/*.repository.ts`) for Prisma queries
4. **Database** (Prisma models in `prisma/schema.prisma`)

---

## 3) Class Scheduling Flow (Faculty and Student)

## 3.1 Faculty Classes APIs

Routes:

- `GET /api/faculty/classes` -> list classes for faculty week view + upcoming + stats
- `POST /api/faculty/classes` -> schedule class
- `PATCH /api/faculty/classes/:classId` -> update class details/status
- `DELETE /api/faculty/classes/:classId` -> delete future scheduled class

Validation schemas:

- `lib/schemas/class.schema.ts`
  - `facultyClassListQuerySchema`
  - `createClassBodySchema`
  - `updateClassBodySchema`

Service logic (`services/class.service.ts`) includes:

- resolve faculty profile by `session.user.id`
- enforce faculty can only manage batches assigned via `BatchFaculty`
- combine date + time into full `Date` objects
- validate end time > start time
- detect overlapping classes in same batch (warns, does not block)
- status transition constraints:
  - `LIVE` only on same day
  - `COMPLETED` only after end time
- deletion restriction:
  - only `SCHEDULED` and future classes can be deleted

Repository logic (`repositories/class.repository.ts`) includes:

- listing faculty classes by week range and optional filters
- upcoming classes (`endTime >= now`, not cancelled)
- overlap check against same-batch sessions
- create/update/delete class session
- class detail fetch with batch + faculty user info

## 3.2 Student Classes API

Route:

- `GET /api/student/classes?tab=upcoming|today|past`

Service (`class.service.ts`) behavior:

- resolve student profile from user
- require `student.batchId`
- fetch classes for student's own batch only
- tab-specific filter logic:
  - `upcoming`: `date >= today`
  - `today`: `todayStart <= date < tomorrowStart`
  - `past`: old date or completed/cancelled

---

## 4) Attendance Flow (Faculty marks, Faculty edits, Student sees summary)

Attendance APIs are under versioned routes:

- `POST /api/v1/attendance` -> create class session + attendance rows in one transaction
- `GET /api/v1/attendance?batchId=...` -> faculty session history for a batch
- `GET /api/v1/attendance/:id` -> faculty session details (students + recorded attendance)
- `PATCH /api/v1/attendance/:id` -> update attendance rows (upsert)
- `GET /api/v1/attendance/student?batchId=...` -> student attendance view

Validation schema:

- `lib/schemas/attendance.schema.ts`

## 4.1 Faculty creates attendance session

Service: `services/attendance.service.ts#createSession`

Repository: `repositories/attendance.repository.ts#createSessionWithAttendance`

Behavior:

1. Resolve facultyId from logged-in user.
2. Create `ClassSession`.
3. Insert all `Attendance` rows for submitted students (`createMany`).
4. Entire operation runs in a Prisma transaction.

## 4.2 Faculty views attendance history

Service:

- `getSessionsForBatchForFaculty`

Repository:

- `findSessionsByBatchForFaculty`

Data returned per session includes:

- subject/topic/date/time/notes
- `presentCount` and `totalCount` computed from attendance rows

## 4.3 Faculty views/edits one session

Service:

- `getSessionDetailForFaculty`
- `updateAttendanceForSession`

Repository:

- `findSessionDetailForFaculty`
- `updateAttendanceForSession`

Important behavior:

- detail query loads both:
  - all batch students (source of truth roster)
  - attendance rows for that session
- edit uses `upsert` by compound key `(studentId, classSessionId)`, so missing rows are created and existing rows are updated.
- service enforces faculty ownership of the session.

## 4.4 Student attendance summary

Service:

- `getStudentAttendance`

Repository:

- `findSessionsForStudent`

Behavior:

1. Resolve logged-in student profile.
2. Ensure requested batch matches student's own batch.
3. Fetch sessions in that batch with attendance filtered to this student.
4. Build:
   - `sessions[]`: per-session PRESENT/ABSENT status + note
   - `subjectSummary[]`: present/total/percentage per subject

---

## 5) How Faculty and Student Data Are Linked

## 5.1 Faculty <-> Batch

- Mapping comes from `BatchFaculty`.
- Used by:
  - class scheduling authorization (`class.service.ts`)
  - attendance batch selector (`fetchMyBatches` -> `/api/v1/batches/my-batches`)

## 5.2 Student <-> Batch

- Mapping is direct via `Student.batchId`.
- Used by:
  - student class list (`/api/student/classes`)
  - student attendance (`/api/v1/attendance/student`)
  - faculty attendance taking (student roster per selected batch from `/api/v1/batches/:id/students-list`)

## 5.3 ClassSession <-> Faculty and Students

- `ClassSession.facultyId` identifies owner faculty.
- `ClassSession.batchId` links to batch roster (students).
- each student in roster can have one attendance row per class session.

---

## 6) Frontend Data Fetch and Display

## 6.1 API Client Layer

Class APIs (`lib/api/classes.ts`):

- faculty schedule CRUD via `/api/faculty/classes...`
- student class list via `/api/student/classes`

Attendance APIs (`lib/api/attendance.ts`, axios base `/api/v1`):

- sessions list/detail/create/update
- student attendance summary

Batch support APIs (`lib/api/batches.ts`):

- faculty batch list (`/batches/my-batches`)
- students in batch (`/batches/:id/students-list`)

## 6.2 Faculty Class Schedule UI

Page:

- `app/(main)/faculty/classes/page.tsx` -> `components/classes/faculty-classes-page-client.tsx`

What is shown:

- week calendar + list view of classes
- filters: batch, subject, week
- upcoming classes sidebar
- weekly stats: total/completed/cancelled
- class details drawer with:
  - date/time, topic, notes, faculty, meet link
  - actions: edit, cancel, mark live, mark complete, delete

Display styling:

- subject theme colors from `lib/constants/class-schedule.ts`
- status badge from `components/class-status-badge.tsx`

## 6.3 Student Classes UI

Page:

- `app/(main)/student/classes/page.tsx` -> `components/classes/student-classes-page-client.tsx`

What is shown:

- tabs: upcoming / today / past
- class cards with subject, status, faculty, notes, cancel note
- join button if meet link exists
- right panel:
  - next class with countdown
  - week dot indicators for days with classes

## 6.4 Faculty Attendance UI

Pages:

- `app/(main)/faculty/attendance/page.tsx`
- `app/(main)/faculty/attendance/[sessionId]/page.tsx`

What is shown:

- batch selector (from faculty-assigned batches)
- take attendance tab:
  - subject/topic/date/notes form
  - student roster table (name, email, roll no)
  - present/absent toggle per student
- history tab:
  - past sessions with present/total counts
  - view/edit actions
- detail modal/page:
  - batch student list + current recorded status
  - edit and save with PATCH

## 6.5 Student Attendance UI

Page:

- `app/(main)/student/attendance/page.tsx`

What is shown:

- subject summary cards:
  - sessions present/total
  - percentage using circular progress
  - warning text when below 75%
- session history table:
  - date, subject, topic, PRESENT/ABSENT badges
  - subject filter dropdown

---

## 7) End-to-End Example Flows

## 7.1 Faculty schedules a class

1. UI submits `CreateClassBody` to `POST /api/faculty/classes`.
2. Service validates ownership + timing + overlap check.
3. Repository creates `ClassSession`.
4. Student classes page can now show the class in upcoming/today based on date.

## 7.2 Faculty takes attendance

1. Faculty selects batch and marks each student present/absent.
2. UI submits to `POST /api/v1/attendance`.
3. Repository creates `ClassSession` and all `Attendance` rows in a transaction.
4. Session appears in faculty history with present/total counts.
5. Student attendance summary updates from same source.

## 7.3 Faculty edits attendance

1. Faculty opens session details.
2. UI toggles status and sends `PATCH /api/v1/attendance/:id`.
3. Repository `upsert`s by `(studentId, classSessionId)`.
4. Faculty history and student summary reflect updated counts.

---

## 8) Current Notes / Implementation Details

- Class scheduling and attendance both use `ClassSession`, but they are exposed through two API surfaces:
  - `/api/faculty/classes` (class schedule management)
  - `/api/v1/attendance` (attendance workflows)
- Attendance creation currently creates a new class session alongside attendance records.
- Frontend has mixed fetch stacks:
  - native `fetch` wrapper in `lib/api/classes.ts`
  - axios wrapper (base `/api/v1`) in `lib/api/attendance.ts` and `lib/api/batches.ts`

