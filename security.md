# SECURITY CHECKLIST — verify all before shipping

## AUTH & SESSION
- [ ] Passwords hashed with bcrypt, cost ≥ 12
- [ ] JWT signed with HS256, expires in 2 hours
- [ ] Session stored in httpOnly + Secure + SameSite=Strict cookie
- [ ] Session invalidated on logout (token blacklist or short expiry)
- [ ] Generic error messages on login failure (never reveal userId existence)
- [ ] Rate limit: 5 login attempts per IP per 15 min (429 response)
- [ ] CSRF token validated on all state-changing POST/PUT/DELETE

## VOTE INTEGRITY
- [ ] hasVoted check and vote insert wrapped in a single DB transaction
- [ ] votes table has NO userId column — ballot secrecy preserved
- [ ] voter_sessions tracks participation only (userId, electionId, hasVoted, votedAt)
- [ ] votes table has a UNIQUE constraint on (electionId, voteToken)
- [ ] voteToken is UUID v4 generated server-side, never client-supplied
- [ ] Verify election status = OPEN before accepting any vote

## INPUT VALIDATION
- [ ] All API inputs validated with Zod schemas
- [ ] All DB queries use parameterized statements (no string concat)
- [ ] File upload endpoints (if any) validate MIME type server-side
- [ ] Candidate IDs validated against DB before inserting vote

## INFRASTRUCTURE
- [ ] All secrets in environment variables — none hardcoded
- [ ] Admin endpoints check ADMIN_SECRET_KEY — return 403 otherwise
- [ ] Error responses never include stack traces or DB error details
- [ ] Supabase Row Level Security (RLS) enabled on all tables
- [ ] RLS policies: voters can only read their own row; 
  votes table is INSERT-only for authenticated voters, 
  SELECT allowed for admin only
- [ ] Audit log is append-only (no UPDATE/DELETE permissions)
- [ ] HTTPS enforced (Vercel does this — confirm in deployment)
- [ ] Security headers: X-Frame-Options DENY, 
  X-Content-Type-Options nosniff, 
  Referrer-Policy strict-origin,
  Content-Security-Policy defined
