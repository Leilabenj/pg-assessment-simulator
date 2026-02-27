# NeuroStack: 14-Day Full-Stack Sprint Roadmap

**Focus:** Transforming a high-fidelity simulation into a production-grade cognitive performance platform.
**Goal:** Achieve a "Recruiter-Ready" portfolio project with modern SDE architecture.

---

## Week 1: The "Architect" Phase
*Goal: Move from local state to persistent data systems. Sign-in is optional; the app is fully usable without an account.*

### Day 1: The TypeScript & State Core (Completed)
- **Focus:** Refine existing Digit & Tube logic.
- **Tasks:**
    - [-] Finalize `validate()` functions for edge cases.
    - [-] Implement "Keypad Lock" logic based on expression constants.
    - [-] Ensure 100% Type safety across `challenge-types.ts`.

### Day 2: Infrastructure & Database (The SDE Jump) (Completed)
- **Focus:** PostgreSQL & Prisma Setup.
- **Tasks:**
    - [-] Provision a **PostgreSQL** instance (Neon.tech or Supabase).
    - [-] Initialize **Prisma** and define `User` and `Session` models.
    - [-] Create a `db.ts` singleton for server-side connections.

### Day 3: Optional Authentication & User Identity
- **Focus:** Clerk integration for users who choose to sign in. The app remains fully playable without an account.
- **Tasks:**
    - [ ] Install and configure **Clerk SDK** for Next.js (sign-in optional; no gate on main app).
    - [ ] Protect only **`/dashboard`** (and any private API routes) with middleware; keep main app and game APIs public.
    - [ ] Sync Clerk `User` metadata with your PostgreSQL `User` record when a user signs in (webhook or on first authenticated request).

### Day 4: Persistence Layer (API Design)
- **Focus:** Server Actions & Data Flow.
- **Tasks:**
    - [ ] Build a Next.js **Server Action** to save session results post-timer (anonymous: `userId` null; signed-in: link to `User`).
    - [ ] Implement robust error handling (Try/Catch) for DB writes.
    - [ ] Add a "Loading" state for post-game data submission.

### Day 5: Performance Analytics (The Data Science Flex)
- **Focus:** Data Visualization.
- **Tasks:**
    - [ ] Integrate **Tremor** or **Recharts** for UI components.
    - [ ] Build a "Session Summary" screen (Radar charts for Speed vs. Accuracy).
    - [ ] Calculate "Level Progression" curves using simple linear regression logic.

### Day 6-7: The Grid Challenge (Game #3)
- **Focus:** Spatial Memory Logic.
- **Tasks:**
    - [ ] Build the `GridMemoryView` (State-driven grid selection).
    - [ ] Implement the "Mental Rotation" interruption phase.
    - [ ] Plug Grid results into the existing `Session` database schema.

---

## 📅 Week 2: The "DevOps & Polish" Phase
*Goal: Production stability, automated testing, and career branding.*

### Day 8: Automated Testing (Reliability)
- **Focus:** Jest & Playwright.
- **Tasks:**
    - [ ] Write **Unit Tests** for math generators (`scripts/generate-challenges.ts`).
    - [ ] Create one **E2E (End-to-End) test** simulating a full 5-minute playthrough.
    - [ ] Ensure 0% regression on the "Unique Digit" rule.

### Day 9: Docker & Containerization
- **Focus:** Portability.
- **Tasks:**
    - [ ] Write a optimized multi-stage `Dockerfile`.
    - [ ] Create a `docker-compose.yml` for local DB and App testing.
    - [ ] Verify production builds locally.

### Day 10: CI/CD Pipeline (GitHub Actions)
- **Focus:** Automated Workflows.
- **Tasks:**
    - [ ] Set up a `.github/workflows/main.yml`.
    - [ ] Automate linting, type-checking, and testing on every `push`.
    - [ ] Connect GitHub to **Vercel** for automatic "Preview" deployments.

### Day 11: Observability & Monitoring
- **Focus:** Real-world stability.
- **Tasks:**
    - [ ] Integrate **Sentry** for frontend error tracking.
    - [ ] Set up **LogRocket** or Vercel Analytics for session replays.
    - [ ] Add structured logging to backend API calls.

### Day 12-13: Final Polish & UI/UX Refinement
- **Focus:** The "Founder" Touch.
- **Tasks:**
    - [ ] Add subtle animations (Framer Motion) for level transitions.
    - [ ] Implement a "Global Leaderboard" (Live SQL query of top scores).
    - [ ] Responsive design check (ensure mobile usability for the keypad).

### Day 14: Career Branding & Deployment
- **Focus:** The "SDE Intern" Pitch.
- **Tasks:**
    - [ ] Finalize the **README.md** with Architecture Diagrams and Tech Stack.
    - [ ] Deploy the final production build to a live URL.
    - [ ] Record a 2-minute "Loom" demo for LinkedIn/Recruiters.

---