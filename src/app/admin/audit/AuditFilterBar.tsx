'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

interface Props {
  eventTypes: string[];
  elections: { id: string; title: string }[];
}

export default function AuditFilterBar({ eventTypes, elections }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentEvent = searchParams.get('event') || '';
  const currentElection = searchParams.get('election') || '';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/audit?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/admin/audit');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
      </div>

      <select
        value={currentEvent}
        onChange={(e) => updateFilters('event', e.target.value)}
        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Event Types</option>
        {eventTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <select
        value={currentElection}
        onChange={(e) => updateFilters('election', e.target.value)}
        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
      >
        <option value="">All Elections</option>
        {elections.map(election => (
          <option key={election.id} value={election.id}>{election.title}</option>
        ))}
      </select>

      {(currentEvent || currentElection) && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider ml-auto"
        >
          <X className="w-3 h-3" />
          Clear All
        </button>
      )}
    </div>
  );
}
