'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Square, Pause, Loader2 } from 'lucide-react';

interface Props {
  electionId: string;
  currentStatus: string;
  isFrozen: boolean;
}

export default function ElectionStatusToggle({ electionId, currentStatus, isFrozen }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (updates: Record<string, string | boolean>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/elections/${electionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to update election');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Phase Control</p>
        {currentStatus === 'PENDING' && (
          <button
            onClick={() => handleUpdateStatus({ status: 'OPEN' })}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            Open Election
          </button>
        )}

        {currentStatus === 'OPEN' && (
          <button
            onClick={() => handleUpdateStatus({ status: 'CLOSED' })}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />}
            Close Election
          </button>
        )}

        {currentStatus === 'CLOSED' && (
          <button
            onClick={() => handleUpdateStatus({ status: 'OPEN' })}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            Re-open Election
          </button>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Visibility Control</p>
        <button
          onClick={() => handleUpdateStatus({ results_frozen: !isFrozen })}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition disabled:opacity-50 ${
            isFrozen 
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Pause className="w-5 h-5" />}
          {isFrozen ? 'Unfreeze Dashboard' : 'Freeze Dashboard'}
        </button>
        <p className="text-[10px] text-center text-slate-400">
          {isFrozen 
            ? 'Results are currently hidden from voters.' 
            : 'Voters can see live results.'}
        </p>
      </div>
      
      <p className="text-[10px] text-center text-slate-400 mt-2">
        Changes will be logged in the audit trail.
      </p>
    </div>
  );
}
