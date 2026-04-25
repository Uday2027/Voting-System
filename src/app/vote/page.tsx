import { redirect } from 'next/navigation';
import { getCurrentVoter } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import BallotForm from './BallotForm';

export default async function VotePage() {
  const session = await getCurrentVoter();
  if (!session) {
    redirect('/login');
  }

  // 1. Check if voter has already voted
  const { data: sessionData } = await supabaseAdmin
    .from('voter_sessions')
    .select('*')
    .eq('voter_id', session.voterId)
    .eq('election_id', session.electionId)
    .single();

  if (sessionData?.has_voted) {
    redirect('/already-voted');
  }

  // 2. Fetch election details
  const { data: election, error: electionError } = await supabaseAdmin
    .from('elections')
    .select('*')
    .eq('id', session.electionId)
    .single();

  if (!election || electionError) {
    return <div className="text-center p-20">Election not found.</div>;
  }

  if (election.status !== 'OPEN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Election is {election.status}</h2>
          <p className="text-slate-500 dark:text-slate-400">Voting is only allowed when the election status is OPEN.</p>
          <a href="/login" className="inline-block mt-6 text-blue-600 font-medium">Return to Login</a>
        </div>
      </div>
    );
  }

  // 3. Fetch candidates
  const { data: candidates } = await supabaseAdmin
    .from('candidates')
    .select('*')
    .eq('election_id', session.electionId)
    .order('display_order', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{election.title}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">{election.description}</p>
        </div>

        <BallotForm electionId={election.id} candidates={candidates || []} />
      </div>
    </div>
  );
}
