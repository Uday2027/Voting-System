import { redirect } from 'next/navigation';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';

export default async function AdminDashboard() {
  if (!isAdminAuthorized()) {
    redirect('/admin/login');
  }

  // Fetch some basic stats
  const { count: electionCount } = await supabaseAdmin
    .from('elections')
    .select('*', { count: 'exact', head: true });

  const { count: voterCount } = await supabaseAdmin
    .from('voters')
    .select('*', { count: 'exact', head: true });

  const { count: voteCount } = await supabaseAdmin
    .from('votes')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage elections and voter credentials.</p>
        </div>
        <Link 
          href="/admin/elections/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
        >
          Create New Election
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Elections" value={electionCount || 0} />
        <StatCard title="Total Registered Voters" value={voterCount || 0} />
        <StatCard title="Total Votes Cast" value={voteCount || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <ActionLink href="/admin/elections" label="Manage Elections" />
            <ActionLink href="/admin/audit" label="View Audit Log" />
            <ActionLink href="/admin/voters" label="Voter Management" />
            <ActionLink href="/dashboard" label="View Live Results" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-4xl font-bold mt-2 text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition duration-200 font-medium"
    >
      {label}
    </Link>
  );
}
