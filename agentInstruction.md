# STEP-BY-STEP AGENT TASK LIST
Build order — give these to your agent one phase at a time

## PHASE 1: Project scaffolding & database
1. Create a Next.js 14 project with TypeScript, Tailwind, and App Router.
2. Install dependencies: supabase-js, bcryptjs, uuid, zod, jose (JWT), recharts, date-fns.
3. Create a /lib/supabase.ts server client and /lib/supabase-browser.ts browser client.
4. Write all SQL migrations (see schema tab) and apply them.
5. Set up .env.local with all required env variables listed in comments.

## PHASE 2: Authentication system
1. Build POST /api/auth/login — validate userId + password with bcrypt, issue a signed JWT (jose), store session in httpOnly cookie (SameSite=Strict, Secure).
2. Build POST /api/auth/logout — clear session cookie.
3. Build a middleware.ts that protects /vote/* and /dashboard/* routes — redirect unauthenticated users to /login.
4. Implement IP-based rate limiting using an in-memory store or Redis (upstash).
5. Log all failed login attempts to audit_log.

## PHASE 3: Admin panel
1. Build /admin — protected by ADMIN_SECRET_KEY header check.
2. Create election form: title, description, start/end datetime, candidate list (dynamic add/remove).
3. Bulk voter generation: admin enters a number (e.g. 500), system generates UUID + 12-char password for each, hashes passwords, inserts into voters table, returns a downloadable CSV of plaintext credentials (shown ONCE).
4. Election management: view all elections, toggle status (PENDING / OPEN / CLOSED).
5. View audit log with filters.

## PHASE 4: Voting flow
1. /login page — userId + password form with error handling (generic messages only — do not reveal whether userId exists).
2. /vote page (server component) — check hasVoted; if true, redirect to /already-voted. If election is CLOSED/PENDING, show appropriate message.
3. Display ballot with candidates. Submit triggers POST /api/vote.
4. /api/vote — inside a DB transaction: verify hasVoted=false, insert vote (no userId in vote record), set hasVoted=true. Return a receiptToken.
5. /confirmation page — display receiptToken with instructions to save it.
6. /verify — public page where anyone can enter a receiptToken to confirm a vote was counted (returns only 'vote counted: yes/no').

## PHASE 5: Live dashboard
1. /dashboard — public results page (or admin-only if election is ongoing — configurable).
2. Summary cards: total eligible voters, total votes cast, turnout %, time remaining.
3. Bar chart of votes per candidate (Recharts BarChart).
4. Pie/donut chart of vote share.
5. Time-series line chart: votes cast over time (grouped by hour).
6. Real-time updates via Supabase Realtime subscription on the votes table — update charts without page refresh.
7. Candidate leaderboard table with rank, name, votes, percentage, and progress bar.
