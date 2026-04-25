import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Voting System Admin</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/admin" className="text-slate-600 dark:text-slate-300 hover:text-blue-600">Dashboard</a></li>
              <li><a href="/admin/elections" className="text-slate-600 dark:text-slate-300 hover:text-blue-600">Elections</a></li>
              <li><a href="/admin/audit" className="text-slate-600 dark:text-slate-300 hover:text-blue-600">Audit Log</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}
