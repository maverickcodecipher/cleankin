'use client';

import { useState, useMemo } from 'react';
import { Trophy, Flame, Skull, Search, Crown } from 'lucide-react';
import type { WardLeaderboardEntry } from '@/types/database';
import { rankTier } from '@/data/tvk-arenas';

interface LeaderboardProps {
  initialData: WardLeaderboardEntry[];
  isDemo?: boolean;
}

function PodiumCard({ entry, place, score }: { entry: WardLeaderboardEntry; place: 1 | 2 | 3; score: number }) {
  const tier = rankTier(score);
  const heights = { 1: 'md:-translate-y-6', 2: '', 3: '' };
  const rings = {
    1: 'border-[#35F27C]/60 shadow-[0_0_50px_rgba(53,242,124,0.3)]',
    2: 'border-white/20',
    3: 'border-amber-500/40',
  };
  const medals = { 1: 'bg-[#35F27C] text-[#04120A]', 2: 'bg-white/15 text-white', 3: 'bg-amber-500/80 text-black' };

  return (
    <div className={`relative rounded-3xl border bg-[#0B100D] p-6 text-center transition-transform hover:-translate-y-1.5 ${heights[place]} ${rings[place]}`}>
      {place === 1 && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#35F27C] text-[#04120A] text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(53,242,124,0.6)]">
          <Crown className="h-3.5 w-3.5" /> League leader
        </div>
      )}
      <span className={`mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${medals[place]}`}>{place}</span>
      <p className="mt-3 text-4xl font-black text-white" style={place === 1 ? { textShadow: tier.glow } : undefined}>{score}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: tier.color }}>{tier.title}</p>
      <p className="mt-2 font-black text-white leading-tight">Ward {entry.ward_number} · {entry.locality_name}</p>
      <p className="text-xs font-bold text-[#93A89A]">{entry.zone_name}</p>
      <div className="mt-3 border-t border-[#1D2B23] pt-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#5C7263]">Area boss</p>
        <p className="text-sm font-black text-[#35F27C]">{entry.incharge_name ?? 'TBD'}</p>
        <p className="text-[11px] font-bold text-[#93A89A]">{entry.incharge_party ?? ''}</p>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs font-black">
        <span className="text-[#FF8FA3]">{entry.active_reports} active</span>
        <span className="text-[#5C7263]">·</span>
        <span className="text-[#35F27C]">{entry.resolved_reports} cleared</span>
      </div>
    </div>
  );
}

export default function Leaderboard({ initialData, isDemo = false }: LeaderboardProps) {
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
        w.incharge_name?.toLowerCase().includes(search.toLowerCase()) ||
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
    const danger = [...initialData].sort((a, b) => b.active_reports - a.active_reports)[0] ?? null;
    return { cleanest, totalWards, activeDumps, clearedDumps, danger };
  }, [initialData]);

  const top3 = filteredData.slice(0, 3);
  const rest = filteredData.slice(3);
  const showPodium = search === '' && zoneFilter === 'all';

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* League header */}
      <div className="text-center mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#35F27C] mb-2">Season 01 · every report is XP</p>
        <h2 className="ck-text-3d text-4xl sm:text-6xl font-black tracking-tight text-white">CHENNAI CLEAN LEAGUE</h2>
        <p className="text-lg text-[#93A89A] mt-3 max-w-2xl mx-auto">
          15 zones. 13 TVK area bosses. Dump reports drain a zone's XP — cleanups charge it back. Bosses rise and fall here, in public.
        </p>
        {isDemo && (
          <p className="mt-4 inline-block text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/10 border border-amber-400/40 rounded-full px-5 py-2">
            Pre-season demo board · run supabase-seed-wards.sql + report dumps for live XP
          </p>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0B100D] border border-[#35F27C]/40 rounded-2xl p-5 text-center shadow-[0_0_25px_rgba(53,242,124,0.12)]">
          <p className="text-xs font-black uppercase tracking-wider text-[#35F27C] mb-1 flex items-center justify-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> Top Zone</p>
          <p className="text-lg font-black text-white truncate">
            {stats.cleanest ? `Ward ${stats.cleanest.ward_number}` : '—'}
          </p>
          <p className="text-xs text-[#93A89A] mt-1 font-bold">
            {stats.cleanest ? `${stats.cleanest.cleanliness_score} XP · ${stats.cleanest.incharge_name ?? ''}` : 'No data'}
          </p>
        </div>
        <div className="bg-[#0B100D] border border-[#1D2B23] rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-[#93A89A] mb-1">Zones At War</p>
          <p className="text-lg font-black text-white">{stats.totalWards}</p>
          <p className="text-xs text-[#5C7263] mt-1 font-bold">Battlegrounds</p>
        </div>
        <div className="bg-[#0B100D] border border-[#FF5470]/40 rounded-2xl p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wider text-[#FF8FA3] mb-1 flex items-center justify-center gap-1.5"><Flame className="h-3.5 w-3.5" /> Active Dumps</p>
          <p className="text-lg font-black text-white">{stats.activeDumps}</p>
          <p className="text-xs text-[#5C7263] mt-1 font-bold">Draining XP now</p>
        </div>
        <div className="bg-[#35F27C] rounded-2xl p-5 text-center shadow-[0_0_30px_rgba(53,242,124,0.35)]">
          <p className="text-xs font-black uppercase tracking-wider text-[#04120A]/70 mb-1">Cleared</p>
          <p className="text-lg font-black text-[#04120A]">{stats.clearedDumps}</p>
          <p className="text-xs text-[#04120A]/70 mt-1 font-bold">Bosses beaten</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search zone, ward, or area boss..."
            className="w-full h-12 px-4 pl-10 rounded-xl border-2 border-[#1D2B23] bg-[#0B100D] text-sm font-bold text-white placeholder:text-[#5C7263] focus:border-[#35F27C] focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C7263]" />
        </div>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="h-12 px-4 rounded-xl border-2 border-[#1D2B23] bg-[#0B100D] text-sm font-bold text-white focus:border-[#35F27C] focus:outline-none transition-colors appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="all">All Zones</option>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-[#0B100D] border border-[#1D2B23] rounded-2xl p-12 text-center">
          <p className="text-lg font-black text-white mb-2">No battlegrounds found</p>
          <p className="text-sm text-[#93A89A]">
            {search || zoneFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'No ward data available at this time.'}
          </p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {showPodium && top3.length === 3 && (
            <div className="grid md:grid-cols-3 gap-5 mb-6 items-end">
              <PodiumCard entry={top3[1]} place={2} score={top3[1].cleanliness_score} />
              <PodiumCard entry={top3[0]} place={1} score={top3[0].cleanliness_score} />
              <PodiumCard entry={top3[2]} place={3} score={top3[2].cleanliness_score} />
            </div>
          )}

          {/* Rows */}
          <div className="grid gap-3">
            {(showPodium ? rest : filteredData).map((ward, idx) => {
              const rank = showPodium ? idx + 4 : idx + 1;
              const tier = rankTier(ward.cleanliness_score);
              return (
                <div key={ward.ward_id} className="group bg-[#0B100D] border border-[#1D2B23] hover:border-[#35F27C]/50 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 transition-all hover:shadow-[0_0_25px_rgba(53,242,124,0.1)]">
                  <div className="flex items-center gap-4 lg:w-72 shrink-0">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-base font-black bg-white/5 border border-[#1D2B23] text-white group-hover:border-[#35F27C]/50 group-hover:text-[#35F27C] transition-all">
                      {rank}
                    </span>
                    <div>
                      <p className="font-black text-white leading-tight">Ward {ward.ward_number} · {ward.locality_name}</p>
                      <p className="text-xs font-bold text-[#93A89A]">{ward.zone_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 lg:w-64 shrink-0 border-y lg:border-y-0 lg:border-x border-[#1D2B23] py-3 lg:py-0 lg:px-4">
                    <div className="w-9 h-9 rounded-full bg-[#35F27C]/15 border border-[#35F27C]/40 flex items-center justify-center font-black text-[#35F27C] text-sm shrink-0">
                      {(ward.incharge_name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5C7263]">Area boss</p>
                      <p className="text-sm font-black text-white truncate">{ward.incharge_name ?? 'TBD'}</p>
                      <p className="text-[11px] font-bold text-[#35F27C]/80 truncate">{ward.incharge_party ?? ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 h-3 bg-white/5 border border-[#1D2B23] rounded-full overflow-hidden">
                      <div className="ck-xp-fill h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(ward.cleanliness_score, 100)}%` }} />
                    </div>
                    <span className="text-base font-black text-white min-w-[3rem] text-right">{ward.cleanliness_score}<span className="text-[10px] text-[#5C7263]"> XP</span></span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shrink-0" style={{ color: tier.color, borderColor: `${tier.color}66`, backgroundColor: `${tier.color}14`, boxShadow: tier.glow }}>
                      {tier.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-sm font-black">
                    <span className="px-3 py-1 rounded-full bg-[#FF5470]/10 text-[#FF8FA3] border border-[#FF5470]/30">{ward.active_reports} active</span>
                    <span className="px-3 py-1 rounded-full bg-[#35F27C]/10 text-[#35F27C] border border-[#35F27C]/30">{ward.resolved_reports} cleared</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Danger zone */}
          {stats.danger && showPodium && (
            <div className="mt-6 rounded-3xl border border-[#FF5470]/40 bg-gradient-to-br from-[#1A0B0E] to-[#0B100D] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-5 overflow-hidden relative">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FF5470]/15 blur-[80px]" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5470]/15 border border-[#FF5470]/40 shrink-0">
                <Skull className="h-7 w-7 text-[#FF8FA3]" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#FF8FA3]">Most wanted · relegation zone</p>
                <p className="text-xl font-black text-white mt-1">
                  {stats.danger.zone_name} — {stats.danger.active_reports} active dumps under {stats.danger.incharge_name ?? 'its boss'}
                </p>
                <p className="text-sm text-[#93A89A] font-medium">Report dumps here for double glory. Flip this zone green and dethrone its boss's rivals.</p>
              </div>
              <a href="/cleankin#map" className="shrink-0 px-7 py-3.5 rounded-2xl bg-[#FF5470] text-[#1A0509] font-black text-sm hover:brightness-110 transition-all text-center">
                Hunt dumps here
              </a>
            </div>
          )}

          {/* Sources footnote */}
          <p className="mt-6 text-center text-[11px] font-medium text-[#5C7263] max-w-3xl mx-auto leading-relaxed">
            Area bosses: TVK Chennai party-district secretaries (public lists Mar 2025; seat cross-check tvkvijay.com 2026).
            Zone coverage mapping is CleanKin editorial. XP = cleanliness score from live dump reports; run <span className="font-mono text-[#93A89A]">supabase-seed-wards.sql</span> to go live.
          </p>
        </>
      )}
    </section>
  );
}
