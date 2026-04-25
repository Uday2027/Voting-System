import { redirect } from 'next/navigation';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import VoterGenerator from './VoterGenerator';

export default async function VoterManagement() {
  if (!isAdminAuthorized()) {
    redirect('/admin/login');
  }

  const { data: elections } = await supabaseAdmin
    .from('elections')
    .select('id, title')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Voter Management</h2>
        <p className="text-slate-500 dark:text-slate-400">Generate secure, unique credentials for your voters.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Generate Bulk Credentials</h3>
        <VoterGenerator elections={elections || []} />
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
        <h4 className="text-amber-800 dark:text-amber-400 font-bold mb-2">Important Security Note</h4>
        <ul className="list-disc list-inside text-amber-700 dark:text-amber-300/80 space-y-1 text-sm">
          <li>Credentials are generated and hashed (bcrypt) on the server.</li>
          <li>A CSV file will be downloaded containing the raw passwords once. **You cannot recover these passwords later.**</li>
          <li>Distribute these credentials securely to your voters.</li>
        </ul>
      </div>
    </div>
  );
}
