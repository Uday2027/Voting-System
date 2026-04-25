import { supabaseAdmin } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Fetch all elections to allow selection
  const { data: elections } = await supabaseAdmin
    .from('elections')
    .select('id, title, status')
    .order('created_at', { ascending: false });

  if (!elections || elections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Elections Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Check back later or contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardClient initialElections={elections} />
    </div>
  );
}
