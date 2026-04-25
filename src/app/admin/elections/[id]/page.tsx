import { redirect } from 'next/navigation';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import ElectionStatusToggle from './ElectionStatusToggle';

export default async function ElectionDetailPage({ params }: { params: { id: string } }) {
  if (!isAdminAuthorized()) {
    redirect('/admin/login');
  }

  const { data: election } = await supabaseAdmin
    .from('elections')
    .select(`
      *,
      candidates (*)
    `)
    .eq('id', params.id)
    .single();

  if (!election) {
    return <div className="text-center p-20">Election not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/elections" 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{election.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Details Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Election Details</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{election.description}</p>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Start Time</p>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  {new Date(election.starts_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">End Time</p>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  {new Date(election.ends_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Candidates</h3>
            <div className="space-y-4">
              {election.candidates.map((candidate: { id: string; name: string; description: string; display_order: number }) => (
                <div 
                  key={candidate.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{candidate.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{candidate.description}</p>
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase px-3 py-1 bg-white dark:bg-slate-900 rounded-lg">
                    Order: {candidate.display_order}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Control */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Election Status</h4>
            <div className="flex items-center gap-3 mb-6">
              <StatusBadge status={election.status} />
              <p className="text-xs text-slate-500">Current Phase</p>
            </div>
            
            <ElectionStatusToggle 
              electionId={election.id} 
              currentStatus={election.status} 
              isFrozen={!!election.results_frozen} 
            />
          </div>

          {/* Stats Summary */}
          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5" />
              <h4 className="font-bold">Quick Actions</h4>
            </div>
            <Link 
              href={`/admin/voters?electionId=${election.id}`}
              className="block w-full text-center bg-white/10 hover:bg-white/20 p-3 rounded-xl transition font-medium mb-3"
            >
              Manage Voter Access
            </Link>
            <Link 
              href={`/dashboard?election=${election.id}`}
              className="block w-full text-center bg-white/10 hover:bg-white/20 p-3 rounded-xl transition font-medium"
            >
              View Real-time Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CLOSED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}
