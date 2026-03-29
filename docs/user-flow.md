# User Flow: Student, Faculty, and Admin

This document captures the end-to-end interaction flow for each user role in Instructis.  
Use it as a product walkthrough, QA checklist, and onboarding reference.

---

## 1) Authentication Flow (Sign In + Email Verification)

1. User opens the app and clicks sign up or sign in.
2. If the user is new, they complete registration and submit email.
3. App sends an email verification link/code to the registered email.
4. User opens the verification email and completes verification.
5. App confirms email verification success.
6. User signs in with verified credentials.
7. App creates/validates session and continues to role-based access.

[insert-screenshot-here]

---

## 2) Common Entry Flow (All Roles)

1. User opens the app landing page.
2. User explores public sections (results, testimonials, callback section).
3. User clicks login/sign-in and completes authentication.
4. App validates session and loads role-based dashboard.
5. User sees only pages and actions allowed for their role.

[insert-screenshot-here]

---

## 3) Student Flow (Start to End)

### Step 1: Access and Onboarding

1. Student logs in.
2. Student lands on the student dashboard.
3. Student confirms profile basics (target exam and personal details if required).

[insert-screenshot-here]

### Step 2: Daily Learning / Assessment Inputs

1. Student attends classes and attempts tests/assessments.
2. Student performance records are updated (marks, percentile, improvement trends).
3. Weak areas become visible in the system.

[insert-screenshot-here]

### Step 3: AI Rank Predictor Usage

1. Student opens **AI Rank Predictor** from the sidebar.
2. Student reviews current performance cards and trend chart.
3. Student clicks refresh/generate to get updated prediction insights.
4. App returns rank ranges, target percentile guidance, and improvement tips.

[insert-screenshot-here]

### Step 4: Improvement Execution

1. Student reviews weak-topic recommendations.
2. Student follows practice/revision guidance from recommendation cards.
3. Student repeats tests and monitors improvement cycle.

[insert-screenshot-here]

### Step 5: Completion State

1. Student continues iterative preparation until target performance.
2. Student can revisit dashboard and predictor any time.
3. Student logs out securely.

[insert-screenshot-here]

---

## 4) Faculty Flow (Start to End)

### Step 1: Access

1. Faculty logs in.
2. Faculty lands on faculty dashboard with assigned academic views.

[insert-screenshot-here]

### Step 2: Monitor Students

1. Faculty checks student progress across classes/batches.
2. Faculty reviews marks history, percentile behavior, and weak areas.
3. Faculty identifies at-risk and high-potential students.

[insert-screenshot-here]

### Step 3: AI-Assisted Analysis

1. Faculty opens predictor/analysis tools for selected students.
2. Faculty triggers AI analysis when needed.
3. Faculty reviews generated rank outlook and actionable suggestions.

[insert-screenshot-here]

### Step 4: Parent/Student Communication

1. Faculty shares progress insights with students.
2. Faculty may trigger parent notifications through available communication flows.
3. Faculty tracks follow-up status and engagement.

[insert-screenshot-here]

### Step 5: Academic Follow-through

1. Faculty plans interventions (practice focus, revision plans, mentoring).
2. Faculty validates impact in subsequent tests and reports.
3. Faculty logs out.

[insert-screenshot-here]

---

## 5) Admin Flow (Start to End)

### Step 1: Access and Control Center

1. Admin logs in.
2. Admin lands on admin dashboard.
3. Admin gets visibility into platform-wide operations.

[insert-screenshot-here]

### Step 2: Configuration and Management

1. Admin manages core entities (users, roles, academic structures, resources).
2. Admin configures operational settings needed by faculty and students.
3. Admin reviews callback requests and other support/operations queues.

[insert-screenshot-here]

### Step 3: Oversight and Governance

1. Admin monitors overall performance and usage.
2. Admin audits role access and policy compliance.
3. Admin resolves escalations from faculty/students.

[insert-screenshot-here]

### Step 4: Continuous Optimization

1. Admin reviews analytics and feedback loops.
2. Admin coordinates process or content improvements.
3. Admin ensures system readiness for ongoing academic cycles.

[insert-screenshot-here]

### Step 5: Completion State

1. Admin confirms operations are stable.
2. Admin logs out securely.

[insert-screenshot-here]

---

## 6) Quick Screenshot Checklist

Capture screenshots for the following milestone screens:

1. Public landing page with sign up/sign in entry.
2. Email verification screen or verification email confirmation state.
3. Post-verification sign-in success screen.
4. Role-based dashboards (student, faculty, admin).
5. Student AI Rank Predictor main screen.
6. Student weak-area recommendations and trend view.
7. Faculty student analysis/predictor screen.
8. Faculty communication/notification action view.
9. Admin management/configuration page.
10. Admin callback requests or operations queue.

[insert-screenshot-here]
