'use client';

import { useRef, useState } from 'react';
import { MapPin, Users, Flame, Megaphone, CalendarDays, MousePointerClick, Trophy } from 'lucide-react';

type Props = {
  onReport: () => void;
  onOrganize: () => void;
  onPickOnMap: () => void;
  picking: boolean;
};

const MARQUEE = ['REPORT DUMPS', 'CLIMB THE LEAGUE', '15 ZONES', '200 WARDS', 'CLEAN CHENNAI', 'EARN XP'];

export default function Hero3D({ onReport, onOrganize, onPickOnMap, picking }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: -8, ry: 12 });

  const handleMouse = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -8 - py * 14, ry: 12 + px * 18 });
  };

  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] border border-[#1D2B23] bg-[#080D0A]">
      {/* arena backdrop */}
      <div className="ck-arena-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#35F27C]/15 blur-[120px] animate-ck-blob" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#A3E635]/10 blur-[100px] animate-ck-blob" style={{ animationDelay: '-6s' }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#35F27C]/70 to-transparent" />

      {/* marquee strip */}
      <div className="relative border-b border-[#1D2B23] bg-black/60 py-2.5 overflow-hidden">
        <div className="animate-ck-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-[#35F27C]/80">
              {m} <span className="text-[#35F27C]/30">●</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative grid gap-10 p-8 md:p-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        {/* Left copy */}
        <div>
          <span className="inline-flex items-center gap-2 bg-[#35F27C]/10 border border-[#35F27C]/30 text-[#35F27C] text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full mb-6">
            <Flame className="h-4 w-4" />
            Season 01 · Chennai Clean League live
          </span>
          <h1 className="ck-text-3d text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[0.95]">
            REPORT.
            <br />
            RALLY.
            <br />
            <span className="bg-gradient-to-r from-[#35F27C] via-[#A3E635] to-[#35F27C] bg-clip-text text-transparent">RANK UP.</span>
          </h1>
          <p className="text-lg text-[#93A89A] max-w-xl mb-8 leading-relaxed">
            Drop a dump pin on the night map. Every report feeds your zone's XP — and moves its TVK area in-charge up or down the <b className="text-white">Chennai Clean League</b>.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onReport}
              className="animate-ck-neon group relative overflow-hidden px-7 py-4 rounded-2xl bg-[#35F27C] text-[#04120A] font-black text-base hover:brightness-110 active:scale-[0.98] transition-all flex items-center"
            >
              <Megaphone className="h-5 w-5 mr-2 transition-transform group-hover:-rotate-12 group-hover:scale-110" />
              Report a Dump Spot
              <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/40 blur-md animate-[ck-shine_2.8s_ease-in-out_infinite]" />
            </button>
            <button
              type="button"
              onClick={onPickOnMap}
              className={`px-7 py-4 rounded-2xl border-2 font-black text-base flex items-center transition-all active:scale-[0.98] ${picking ? 'bg-[#FF5470] border-[#FF5470] text-white animate-pulse' : 'border-[#35F27C]/50 text-[#35F27C] hover:bg-[#35F27C]/10'}`}
            >
              <MousePointerClick className="h-5 w-5 mr-2" />
              {picking ? 'Picking… click map below' : 'Pin on map'}
            </button>
            <button
              type="button"
              onClick={onOrganize}
              className="px-7 py-4 rounded-2xl border-2 border-[#2A3B32] font-black text-base text-white hover:border-[#A3E635] hover:text-[#A3E635] transition-all flex items-center active:scale-[0.98]"
            >
              <CalendarDays className="h-5 w-5 mr-2" />
              Organize a Drive
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-widest text-[#93A89A]">
            <span className="bg-white/5 border border-[#1D2B23] rounded-full px-4 py-2">✓ Click-to-pin night map</span>
            <span className="bg-white/5 border border-[#1D2B23] rounded-full px-4 py-2">✓ Delete / Cancel anything</span>
            <span className="bg-white/5 border border-[#1D2B23] rounded-full px-4 py-2">✓ 13 TVK battlegrounds</span>
          </div>
        </div>

        {/* Right 3D scene */}
        <div ref={wrapRef} onMouseMove={handleMouse} onMouseLeave={() => setTilt({ rx: -8, ry: 12 })} className="perspective-1600 relative mx-auto w-full max-w-md h-[420px]">
          <div
            className="preserve-3d absolute inset-0 transition-transform duration-200 ease-out"
            style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
          >
            {/* base map card */}
            <div
              className="ck-card-3d absolute left-1/2 top-1/2 h-72 w-80 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-[#35F27C]/25 bg-[#0B100D] shadow-[0_30px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(53,242,124,0.15)] overflow-hidden"
              style={{ transform: 'translateZ(0px)' }}
            >
              <div className="h-40 relative bg-[#070B09]">
                <div className="ck-arena-grid absolute inset-0" />
                <div className="absolute left-8 top-10 h-3 w-3 rounded-full bg-[#FF5470] shadow-[0_0_12px_rgba(255,84,112,0.9)] animate-ck-pin" />
                <div className="absolute left-24 top-16 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-ck-pin" style={{ animationDelay: '-0.7s' }} />
                <div className="absolute left-40 top-8 h-3 w-3 rounded-full bg-[#35F27C] shadow-[0_0_12px_rgba(53,242,124,0.9)] animate-ck-pin" style={{ animationDelay: '-1.3s' }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-[#35F27C]/25 animate-[ck-ring-ping_2s_ease-out_infinite]" />
                    <div className="bg-[#35F27C] text-[#04120A] rounded-2xl p-3 shadow-[0_0_25px_rgba(53,242,124,0.7)]">
                      <MapPin className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-[#1D2B23]">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#35F27C]">Night ops map · Chennai</p>
                <p className="font-extrabold text-white">128 pins · 24 raids · 350+ players</p>
              </div>
            </div>

            {/* floating report card */}
            <div className="animate-ck-float absolute -left-2 top-6 rounded-2xl border border-[#FF5470]/40 bg-[#14090C]/95 shadow-[0_0_25px_rgba(255,84,112,0.25)] p-4 w-44" style={{ transform: 'translateZ(90px)' }}>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#FF5470]">+25 XP · New dump</p>
              <p className="text-sm font-extrabold text-white">Adyar canal bank</p>
              <p className="text-xs font-bold text-[#93A89A]">Zone 13 · just now</p>
            </div>

            {/* floating league card */}
            <div className="animate-ck-float-slow absolute -right-2 bottom-8 rounded-2xl border border-[#35F27C]/40 bg-[#35F27C] text-[#04120A] shadow-[0_0_35px_rgba(53,242,124,0.45)] p-4 w-48" style={{ transform: 'translateZ(120px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-widest">League leader</p>
              </div>
              <p className="text-sm font-black">Zone 7 · Ambattur</p>
              <div className="mt-2 h-2 rounded-full bg-black/20 overflow-hidden">
                <div className="ck-xp-fill h-full w-3/4 rounded-full" />
              </div>
            </div>

            {/* orbiting badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ transform: 'translateZ(-60px)' }}>
              <div className="animate-ck-spin-slow h-80 w-80 rounded-full border-2 border-dashed border-[#35F27C]/25" />
            </div>
          </div>
        </div>
      </div>

      {/* bottom stat strip */}
      <div className="relative border-t border-[#1D2B23] bg-black/50 px-8 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
        {[
          ['128', 'DUMPS PINNED'],
          ['24', 'CLEANUP RAIDS'],
          ['350+', 'PLAYERS'],
          ['15', 'ZONES AT WAR'],
        ].map(([v, l]) => (
          <div key={l} className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#35F27C]">{v}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#93A89A]">{l}</span>
          </div>
        ))}
        <span className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#5C7263]">
          <Users className="h-3.5 w-3.5" /> 13 TVK area bosses ranked weekly
        </span>
      </div>
    </section>
  );
}
