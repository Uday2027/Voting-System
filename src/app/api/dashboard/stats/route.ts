import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const electionId = request.nextUrl.searchParams.get('electionId');

  if (!electionId) {
    return NextResponse.json({ error: 'Election ID is required' }, { status: 400 });
  }

  // 1. Fetch Election Info
  const { data: election } = await supabaseAdmin
    .from('elections')
    .select('*')
    .eq('id', electionId)
    .single();

  // 2. Fetch Candidates
  const { data: candidates } = await supabaseAdmin
    .from('candidates')
    .select('*')
    .eq('election_id', electionId);

  // 3. Fetch Votes Count per Candidate
  const { data: votes } = await supabaseAdmin
    .from('votes')
    .select('candidate_id')
    .eq('election_id', electionId);

  // 4. Fetch Voter Stats
  const { count: totalEligible } = await supabaseAdmin
    .from('voters')
    .select('*', { count: 'exact', head: true })
    .eq('election_id', electionId);

  const { count: totalCast } = await supabaseAdmin
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('election_id', electionId);

  // Process results
  const isFrozen = !!election?.results_frozen;
  const results = isFrozen ? [] : candidates?.map(c => {
    const candidateVotes = votes?.filter(v => v.candidate_id === c.id).length || 0;
    return {
      id: c.id,
      name: c.name,
      votes: candidateVotes,
      percentage: totalCast ? (candidateVotes / totalCast) * 100 : 0,
    };
  }).sort((a, b) => b.votes - a.votes);

  return NextResponse.json({
    election,
    isFrozen,
    stats: {
      totalEligible: totalEligible || 0,
      totalCast: totalCast || 0,
      turnout: totalEligible ? (totalCast || 0) / totalEligible * 100 : 0,
    },
    results,
    // Add time-series data (simplified for now)
    timeSeries: [
      // This would normally be grouped by hour from the database
      { time: '12:00', votes: 10 },
      { time: '13:00', votes: 25 },
      { time: '14:00', votes: 45 },
    ]
  });
}
