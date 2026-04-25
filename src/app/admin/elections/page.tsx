import { redirect } from 'next/navigation';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import { Calendar, ChevronRight, Settings } from 'lucide-react';

export default async function ElectionsManagement() {
  if (!isAdminAuthorized()) {
    redirect('/admin/login');
  }

  const { data: elections, error } = await supabaseAdmin
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Elections</h2>
          <p className="text-slate-500 dark:text-slate-400">View and manage all voting events.</p>
        </div>
        <Link 
          href="/admin/elections/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition duration-200 shadow-lg shadow-blue-500/20"
        >
          + New Election
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {elections && elections.length > 0 ? (
          elections.map((election) => (
            <div 
              key={election.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                      {election.title}
                    </h3>
                    <StatusBadge status={election.status} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                    {election.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Starts: {new Date(election.starts_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Ends: {new Date(election.ends_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/elections/${election.id}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/admin/elections/${election.id}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">No elections found. Create one to get started!</p>
          </div>
        )}
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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}
