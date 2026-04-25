export interface Voter {
  id: string;
  election_id: string;
  password_hash: string;
  created_at: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'OPEN' | 'CLOSED';
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  election_id: string;
  name: string;
  description: string;
  display_order: number;
}

export interface Vote {
  id: string;
  election_id: string;
  candidate_id: string;
  vote_token: string;
  receipt_token: string;
  created_at: string;
}

export interface JWTPayload {
  voterId: string;
  electionId: string;
  iat: number;
  exp: number;
}
