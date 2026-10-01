'use client';

import { useState, useMemo } from 'react';
import type { WardLeaderboardEntry } from '@/types/database';

interface LeaderboardProps {
  initialData: WardLeaderboardEntry[];
}

function getScoreBadge(score: number): { label: string; bg: string; text: string; border: string } {
  if (score >= 90) return { label: 'Pristine', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' };
  if (score >= 70) return { label: 'Good', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' };
  return { label: 'Needs Work', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' };
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981';
  if (score >= 70) return '#F97316';
  return '#F43F5E';
}

export default function Leaderboard({ initialData }: LeaderboardProps) {
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');

  const zones = useMemo(() => {
    const z = new Set(initialData.map((w) => w.zone_name));
    return Array.from(z).sort();
  }, [initialData]);

  const filteredData = useMemo(() => {
    return initialData.filter((w) => {
      const matchesSearch =
        search === '' ||
        w.locality_name.toLowerCase().includes(search.toLowerCase()) ||
        String(w.ward_number).includes(search);
      const matchesZone = zoneFilter === 'all' || w.zone_name === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [initialData, search, zoneFilter]);

  const stats = useMemo(() => {
    const cleanest = initialData[0] ?? null;
    const totalWards = initialData.length;
    const activeDumps = initialData.reduce((acc, w) => acc + w.active_reports, 0);
    const clearedDumps = initialData.reduce((acc, w) => acc + w.resolved_reports, 0);
    return { cleanest, totalWards, activeDumps, clearedDumps };
  }, [initialData]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-700 mb-1">Cleanest Ward</p>
          <p className="text-lg font-extrabold text-emerald-900 truncate">
            {stats.cleanest ? `Ward ${stats.cleanest.ward_number}` : '—'}
          </p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">
            {stats.cleanest ? `${stats.cleanest.cleanliness_score} pts` : 'No data'}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Total Wards</p>
          <p className="text-lg font-extrabold text-slate-900">{stats.totalWards}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Tracked</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-rose-700 mb-1">Active Dumps</p>
          <p className="text-lg font-extrabold text-rose-900">{stats.activeDumps}</p>
          <p className="text-xs text-rose-600 mt-1 font-medium">Across Chennai</p>
        </div>
        <div className="bg-civic-orange/5 border border-civic-orange/20 rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-civic-orange mb-1">Cleared</p>
          <p className="text-lg font-extrabold text-civic-orange">{stats.clearedDumps}</p>
          <p className="text-xs text-civic-orange/70 mt-1 font-medium">Successfully Resolved</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search locality or ward number..."
            className="w-full h-12 px-4 pl-10 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:border-civic-orange focus:outline-none transition-colors"
          />
          <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:border-civic-orange focus:outline-none transition-colors appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="all">All Zones</option>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      {/* Table / Cards */}
      {filteredData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-lg font-extrabold text-slate-800 mb-2">No wards found</p>
          <p className="text-sm text-slate-500">
            {search || zoneFilter !== 'all'
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'No ward data available at this time.'}
          </p>
        </div>
      ) : (
        <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500 w-16">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Ward & Zone</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">Locality</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">In-Charge</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Active</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500">Resolved</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-500 w-48">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((ward, idx) => {
                const badge = getScoreBadge(ward.cleanliness_score);
                const scoreColor = getScoreColor(ward.cleanliness_score);
                return (
                  <tr key={ward.ward_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${
                        idx === 0 ? 'bg-civic-orange text-white' :
                        idx === 1 ? 'bg-slate-300 text-white' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">Ward {ward.ward_number}</span>
                      <span className="block text-xs text-slate-500 mt-0.5">{ward.zone_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{ward.locality_name}</td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">{ward.incharge_name ?? '—'}</span>
                      {ward.incharge_party && (
                        <span className="block text-xs text-slate-400">{ward.incharge_party}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-sm font-bold">
                        {ward.active_reports}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold">
                        {ward.resolved_reports}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(ward.cleanliness_score, 100)}%`, backgroundColor: scoreColor }}
                          />
                        </div>
                        <span className="text-sm font-black text-slate-900 min-w-[3rem] text-right">{ward.cleanliness_score}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="lg:hidden grid gap-4">
        {filteredData.map((ward, idx) => {
          const badge = getScoreBadge(ward.cleanliness_score);
          const scoreColor = getScoreColor(ward.cleanliness_score);
          return (
            <div key={ward.ward_id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-black ${
                    idx === 0 ? 'bg-civic-orange text-white' :
                    idx === 1 ? 'bg-slate-300 text-white' :
                    idx === 2 ? 'bg-amber-700 text-white' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">Ward {ward.ward_number} — {ward.zone_name}</p>
                    <p className="text-sm text-slate-500">{ward.locality_name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{ward.incharge_name ?? 'No in-charge'} {ward.incharge_party ? `· ${ward.incharge_party}` : ''}</span>
                <div className="flex items-center gap-1">
                  <span className="font-black text-rose-600">{ward.active_reports}</span>
                  <span className="text-slate-400">active</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-black text-emerald-600">{ward.resolved_reports}</span>
                  <span className="text-slate-400">cleared</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(ward.cleanliness_score, 100)}%`, backgroundColor: scoreColor }} />
                </div>
                <span className="text-sm font-black text-slate-900">{ward.cleanliness_score}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
