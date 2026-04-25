# POSTGRESQL SCHEMA
Run this migration in Supabase SQL editor

```sql
-- Elections
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING','OPEN','CLOSED')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0
);

-- Voters (credentials only — no personal data)
CREATE TABLE voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Voter participation (who voted — NOT what they voted)
CREATE TABLE voter_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID REFERENCES voters(id),
  election_id UUID REFERENCES elections(id),
  has_voted BOOLEAN DEFAULT false,
  voted_at TIMESTAMPTZ,
  UNIQUE(voter_id, election_id)
);

-- Votes (anonymous — no voter link)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES elections(id),
  candidate_id UUID REFERENCES candidates(id),
  vote_token UUID UNIQUE DEFAULT gen_random_uuid(),
  receipt_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log (append-only)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  ip_address TEXT,
  voter_id UUID,
  election_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX ON votes(election_id, created_at);
CREATE INDEX ON votes(candidate_id);
CREATE INDEX ON voter_sessions(voter_id, election_id);
CREATE INDEX ON audit_log(election_id, event_type);

-- Row Level Security
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Secure Voting Stored Procedure (Atomic Transaction)
CREATE OR REPLACE FUNCTION cast_vote(
  p_voter_id UUID,
  p_election_id UUID,
  p_candidate_id UUID
) RETURNS UUID AS $$
DECLARE
  v_receipt_token UUID;
  v_has_voted BOOLEAN;
  v_election_status TEXT;
BEGIN
  -- 1. Check election status
  SELECT status INTO v_election_status FROM elections WHERE id = p_election_id;
  IF v_election_status != 'OPEN' THEN
    RAISE EXCEPTION 'Election is not open';
  END IF;

  -- 2. Check if voter has already voted (FOR UPDATE to lock the row)
  SELECT has_voted INTO v_has_voted FROM voter_sessions 
  WHERE voter_id = p_voter_id AND election_id = p_election_id
  FOR UPDATE;

  IF v_has_voted THEN
    RAISE EXCEPTION 'Voter has already cast a ballot';
  END IF;

  -- 3. Mark as voted
  UPDATE voter_sessions 
  SET has_voted = true, voted_at = now()
  WHERE voter_id = p_voter_id AND election_id = p_election_id;

  -- 4. Insert anonymous vote
  INSERT INTO votes (election_id, candidate_id)
  VALUES (p_election_id, p_candidate_id)
  RETURNING receipt_token INTO v_receipt_token;

  RETURN v_receipt_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
