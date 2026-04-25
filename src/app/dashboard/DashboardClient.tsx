'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  Users, Vote, Percent, Clock, RefreshCw, Trophy, ChevronDown
} from 'lucide-react';

interface Election {
  id: string;
  title: string;
  status: string;
}

interface DashboardClientProps {
  initialElections: Election[];
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#4f46e5'];

export default function DashboardClient({ initialElections }: DashboardClientProps) {
  const [selectedElectionId, setSelectedElectionId] = useState(initialElections[0].id);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/stats?electionId=${selectedElectionId}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const { election, stats, results, timeSeries, isFrozen } = data || {};

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{election?.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              election?.status === 'OPEN' ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-slate-200 text-slate-600'
            }`}>
              {election?.status}
            </span>
          </div>
          <p className="text-slate-500 mt-1 flex items-center">
            <Clock className="w-4 h-4 mr-2" /> Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="relative group">
          <select 
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 pr-10 rounded-xl font-medium shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
          >
            {initialElections.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-blue-600" />} label="Eligible Voters" value={stats?.totalEligible ?? 0} />
        <StatCard icon={<Vote className="text-purple-600" />} label="Votes Cast" value={stats?.totalCast ?? 0} />
        <StatCard icon={<Percent className="text-pink-600" />} label="Turnout" value={`${(stats?.turnout ?? 0).toFixed(1)}%`} />
      </div>

      {/* Charts Grid */}
      <div className="relative">
        {isFrozen && (
          <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/30 dark:bg-slate-900/30 flex items-center justify-center rounded-3xl border-2 border-dashed border-amber-400/50 m-[-4px]">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl text-center border border-slate-200 dark:border-slate-800 max-w-sm">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Results are Frozen</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                The administrator has temporarily paused live updates. Check back later for the final results.
              </p>
            </div>
          </div>
        )}
        
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isFrozen ? 'opacity-50 grayscale' : ''}`}>
          {/* Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" /> Candidate Performance
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="votes" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Vote Share %</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={results}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {results?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold">Live Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-xs tracking-wider font-bold">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Votes</th>
                <th className="p-4">Share</th>
                <th className="p-4 pr-6">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results?.map((candidate: any, index: number) => (
                <tr key={candidate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="p-4 pl-6 font-bold text-slate-400">#{index + 1}</td>
                  <td className="p-4 font-bold">{candidate.name}</td>
                  <td className="p-4 font-bold">{candidate.votes.toLocaleString()}</td>
                  <td className="p-4">{(candidate.percentage ?? 0).toFixed(1)}%</td>
                  <td className="p-4 pr-6">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${candidate.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}
