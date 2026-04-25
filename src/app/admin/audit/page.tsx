import { redirect } from 'next/navigation';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

import AuditFilterBar from './AuditFilterBar';

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { event?: string; election?: string };
}) {
  if (!isAdminAuthorized()) {
    redirect('/admin/login');
  }

  // 1. Fetch filter options
  const { data: eventTypesData } = await supabaseAdmin
    .from('audit_log')
    .select('event_type');
  
  const eventTypes = Array.from(new Set((eventTypesData || []).map(d => d.event_type))).sort();

  const { data: elections } = await supabaseAdmin
    .from('elections')
    .select('id, title')
    .order('created_at', { ascending: false });

  // 2. Fetch filtered logs
  let query = supabaseAdmin
    .from('audit_log')
    .select('*');

  if (searchParams.event) {
    query = query.eq('event_type', searchParams.event);
  }
  if (searchParams.election) {
    query = query.eq('election_id', searchParams.election);
  }

  const { data: logs, error } = await query
    .order('created_at', { ascending: false })
    .limit(100);

  // Generate signed URLs for photos
  const logsWithPhotos = await Promise.all((logs || []).map(async (log) => {
    try {
      // Handle cases where metadata might be stringified
      const metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
      const photoPath = metadata?.photo_path;

      if (photoPath) {
        const { data, error: signedUrlError } = await supabaseAdmin
          .storage
          .from('audit-photos')
          .createSignedUrl(photoPath, 3600);
        
        if (signedUrlError) {
          console.error('Error creating signed URL for', photoPath, ':', signedUrlError.message);
        }

        return { ...log, metadata, photoUrl: data?.signedUrl };
      }
      return { ...log, metadata };
    } catch (err) {
      console.error('Error processing log metadata:', err);
      return log;
    }
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Security Audit Log</h2>
        <p className="text-sm text-slate-500">Showing last 100 events</p>
      </div>

      <AuditFilterBar 
        eventTypes={eventTypes} 
        elections={elections || []} 
      />
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Timestamp</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Event Type</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">IP Address</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {logsWithPhotos.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventStyle(log.event_type)}`}>
                    {log.event_type}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-400 font-mono">
                  {log.ip_address}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-3">
                    {log.photoUrl ? (
                      <div className="space-y-2">
                        <div className="relative group w-24 h-24">
                          <img 
                            src={log.photoUrl} 
                            alt="Voter Audit" 
                            className="w-full h-full object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all cursor-zoom-in group-hover:scale-[2.5] group-hover:z-50 group-hover:relative origin-top-left"
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition rounded-xl" />
                        </div>
                        <a 
                          href={log.photoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                          Open Full Image ↗
                        </a>
                      </div>
                    ) : log.metadata?.has_photo ? (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">
                        Photo missing or expired
                      </div>
                    ) : null}
                    
                    <pre className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 overflow-auto max-w-xs max-h-32">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 italic">No security events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getEventStyle(type: string) {
  if (type.includes('SUCCESS')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (type.includes('FAILED')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  if (type.includes('RATE_LIMIT')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
}
