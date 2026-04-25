'use client';
import { useState } from 'react';
import { Users, Download, Loader2 } from 'lucide-react';

interface Election {
  id: string;
  title: string;
}

export default function VoterGenerator({ elections }: { elections: Election[] }) {
  const [electionId, setElectionId] = useState('');
  const [count, setCount] = useState(50);
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [useEmails, setUseEmails] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electionId) return;

    const emailList = useEmails ? emails.split('\n').map(e => e.trim()).filter(e => e !== '') : [];
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/voters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          electionId, 
          count: useEmails ? emailList.length : count,
          emails: emailList
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voters_${electionId}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert('Failed to generate voters');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-6 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Select Election
        </label>
        <select
          value={electionId}
          onChange={(e) => setElectionId(e.target.value)}
          className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
          required
        >
          <option value="">Choose an election...</option>
          {elections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={useEmails}
            onChange={(e) => setUseEmails(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Use Email List (Generates & Sends Emails)
          </span>
        </label>

        {!useEmails ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Number of Anonymous Voters to Generate
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-16 text-center font-bold text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                {count}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Addresses (one per line)
            </label>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="voter1@example.com&#10;voter2@example.com"
              className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
              required
            />
            <p className="mt-2 text-xs text-slate-500">
              Generating {emails.split('\n').filter(e => e.trim()).length} credentials.
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !electionId}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : success ? (
          <>
            <Download className="w-5 h-5" />
            CSV Downloaded!
          </>
        ) : (
          <>
            <Users className="w-5 h-5" />
            Generate & Download CSV
          </>
        )}
      </button>
    </form>
  );
}
