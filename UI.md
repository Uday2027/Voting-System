# PAGES TO BUILD

## /login
- Clean centered card layout
- Fields: Voter ID (UUID input), Password
- Show/hide password toggle
- Generic error: "Invalid credentials"
- Loading state on submit
- Link to /verify for receipt check

## /vote
- Show election title + description
- Countdown timer to election close
- Radio button candidate list (one selection)
- Each candidate card: name, description, avatar initials
- Confirm modal before final submission
- Disabled submit until candidate selected

## /confirmation
- Success state with checkmark animation
- Display receipt token in a highlighted box
- "Copy to clipboard" button
- Instructions: "Save this token to verify your vote"
- DO NOT show who they voted for (secrecy)

## /already-voted
- Inform voter they have already cast their ballot
- Show link to /verify

## /verify
- Public page — no auth required
- Input: receipt token
- Response: "This receipt token is valid — your vote was counted" or "Token not found"
- No other information revealed

## /dashboard
### STAT CARDS (top row)
- Total eligible voters
- Total votes cast  
- Voter turnout %
- Time remaining / Election status badge

### CHARTS
- Bar chart: votes per candidate (horizontal, sorted desc)
- Donut chart: vote share %
- Line chart: cumulative votes over time (hourly)

### LEADERBOARD TABLE
Rank | Candidate | Votes | Share | Progress bar

### LIVE INDICATOR
- Pulsing green dot + "Live" badge when election is OPEN
- Auto-refresh every 5s OR Supabase Realtime subscription
- Last updated timestamp

## /admin (protected)
- Create election form
- Generate voters (number input → CSV download)
- Election list with status toggle
- Audit log viewer with filters
