'use client';
import { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function VerifyPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'found' | 'not-found' | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/verify?token=${token}`);
      if (res.ok) {
        setResult('found');
      } else {
        setResult('not-found');
      }
    } catch (err) {
      setResult('not-found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verify Your Vote</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your receipt token to confirm your vote was counted.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Receipt Token</label>
              <div className="relative">
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="block w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg font-mono"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute inset-y-2 right-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          {result && (
            <div className={`mt-8 p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
              result === 'found' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
            }`}>
              <div className="flex items-center">
                {result === 'found' ? <CheckCircle2 className="w-6 h-6 mr-3" /> : <ShieldAlert className="w-6 h-6 mr-3" />}
                <div>
                  <h3 className="font-bold text-lg">
                    {result === 'found' ? 'Vote Counted' : 'Token Not Found'}
                  </h3>
                  <p className="text-sm mt-1 opacity-90">
                    {result === 'found' 
                      ? 'This receipt token is valid. Your vote was successfully recorded in the blockchain-inspired anonymous ledger.' 
                      : 'The provided receipt token does not exist in our records. Please check the token and try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a href="/login" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
