import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AlreadyVotedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ballot Already Cast</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Our records show that you have already submitted your vote for this election. To maintain ballot integrity, each voter is allowed exactly one submission.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/verify"
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            Verify Your Receipt <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link 
            href="/dashboard"
            className="flex items-center justify-center w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}
