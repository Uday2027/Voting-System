'use client';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-green-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Vote Confirmed!</h1>
            <p className="text-green-100 mt-2">Your ballot has been successfully recorded and anonymized.</p>
          </div>

          <div className="p-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 relative group">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider text-center">Your Receipt Token</p>
              <div className="flex items-center justify-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                <code className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400 break-all text-center select-all">
                  {token || 'TOKEN-NOT-FOUND'}
                </code>
              </div>
              <button
                onClick={copyToClipboard}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Save this token carefully. You can use it later to verify that your vote was counted in the final results without revealing your choice.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Link 
                  href="/verify"
                  className="flex items-center justify-center w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:opacity-90 transition"
                >
                  Verify Now <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link 
                  href="/dashboard"
                  className="flex items-center justify-center w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  View Live Results
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
