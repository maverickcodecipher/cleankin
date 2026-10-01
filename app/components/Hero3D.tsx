'use client';

import { useRef, useState } from 'react';
import { MapPin, Users, Sparkles, Megaphone, CalendarDays, MousePointerClick } from 'lucide-react';

type Props = {
  onReport: () => void;
  onOrganize: () => void;
  onPickOnMap: () => void;
  picking: boolean;
};

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
    <section
      className="relative w-full overflow-hidden rounded-[2.5rem] border border-teal-100"
      style={{
        background:
          'radial-gradient(1200px 500px at 15% -10%, rgba(20,184,166,0.25), transparent), radial-gradient(900px 500px at 90% 0%, rgba(249,115,22,0.18), transparent), linear-gradient(180deg, #ECFDF5 0%, #F8FAFC 60%, #FFF7ED 100%)',
      }}
    >
      {/* animated blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-300/30 blur-3xl animate-ck-blob" />
      <div className="pointer-events-none absolute top-10 right-[-80px] h-[28rem] w-[28rem] rounded-full bg-orange-300/25 blur-3xl animate-ck-blob" style={{ animationDelay: '-6s' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(circle, rgba(13,92,117,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative grid gap-10 p-8 md:p-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        {/* Left copy */}
        <div>
          <span className="inline-flex items-center gap-2 bg-[#0D5C75]/10 text-[#0D5C75] text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            Chennai Civic Action Network · 3D Live Map
          </span>
          <h1 className="ck-text-3d text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.02]">
            Turn dump spots into{' '}
            <span className="bg-gradient-to-r from-[#0D5C75] via-teal-600 to-orange-500 bg-clip-text text-transparent">
              community action
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-xl mb-8 leading-relaxed">
            Report a dump, drop a 3D pin on the Chennai map, rally a weekend drive, and watch wards flip from red to green.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onReport}
              className="group relative overflow-hidden px-7 py-4 rounded-full text-white font-bold text-base shadow-xl shadow-teal-900/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center"
              style={{ backgroundColor: '#0D5C75' }}
            >
              <Megaphone className="h-5 w-5 mr-2 transition-transform group-hover:-rotate-12 group-hover:scale-110" />
              Report a Dump Spot
              <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/25 blur-md animate-[ck-shine_2.8s_ease-in-out_infinite]" />
            </button>
            <button
              type="button"
              onClick={onPickOnMap}
              className={`px-7 py-4 rounded-full border-2 font-bold text-base flex items-center transition-all active:scale-[0.98] ${picking ? 'bg-[#0D5C75] text-white border-[#0D5C75] shadow-xl' : 'border-[#0D5C75] text-[#0D5C75] hover:bg-teal-50'}`}
            >
              <MousePointerClick className="h-5 w-5 mr-2" />
              {picking ? 'Picking… click map below' : 'Pin on map'}
            </button>
            <button
              type="button"
              onClick={onOrganize}
              className="px-7 py-4 rounded-full border-2 border-slate-300 font-bold text-base text-slate-700 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center active:scale-[0.98]"
            >
              <CalendarDays className="h-5 w-5 mr-2" />
              Organize a Drive
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            <span className="bg-white/80 border border-slate-200 rounded-full px-4 py-2">✓ Click-to-pin</span>
            <span className="bg-white/80 border border-slate-200 rounded-full px-4 py-2">✓ Delete / Cancel anything</span>
            <span className="bg-white/80 border border-slate-200 rounded-full px-4 py-2">✓ Live 3D pins</span>
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
              className="ck-card-3d absolute left-1/2 top-1/2 h-72 w-80 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/60 bg-white/80 shadow-2xl shadow-teal-900/25 overflow-hidden"
              style={{ transform: 'translateZ(0px)' }}
            >
              <div className="h-40 bg-gradient-to-br from-teal-100 via-emerald-50 to-orange-100 relative">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(13,92,117,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(13,92,117,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="absolute left-8 top-10 h-3 w-3 rounded-full bg-red-500 shadow-lg animate-ck-pin" />
                <div className="absolute left-24 top-16 h-3 w-3 rounded-full bg-amber-500 shadow-lg animate-ck-pin" style={{ animationDelay: '-0.7s' }} />
                <div className="absolute left-40 top-8 h-3 w-3 rounded-full bg-emerald-500 shadow-lg animate-ck-pin" style={{ animationDelay: '-1.3s' }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-[#0D5C75]/20 animate-[ck-ring-ping_2s_ease-out_infinite]" />
                    <div className="bg-[#0D5C75] text-white rounded-2xl p-3 shadow-xl">
                      <MapPin className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-widest text-[#0D5C75]">Live Chennai Civic Map</p>
                <p className="font-extrabold text-slate-900">128 spots · 24 drives · 350+ volunteers</p>
              </div>
            </div>

            {/* floating report card */}
            <div className="animate-ck-float absolute -left-2 top-6 rounded-2xl border border-white/60 bg-white/90 shadow-xl p-4 w-44" style={{ transform: 'translateZ(90px)' }}>
              <p className="text-[11px] font-black uppercase tracking-widest text-red-600">New dump pin</p>
              <p className="text-sm font-extrabold text-slate-900">Adyar canal bank</p>
              <p className="text-xs font-bold text-slate-500">Just now · Open</p>
            </div>

            {/* floating volunteers card */}
            <div className="animate-ck-float-slow absolute -right-2 bottom-8 rounded-2xl border border-white/60 bg-[#0D5C75] text-white shadow-xl p-4 w-48" style={{ transform: 'translateZ(120px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-widest text-white/80">Weekend drive</p>
              </div>
              <p className="text-sm font-extrabold">Besant Nagar · 32 joined</p>
              <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-300 to-orange-300" />
              </div>
            </div>

            {/* orbiting badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ transform: 'translateZ(-60px)' }}>
              <div className="animate-ck-spin-slow h-80 w-80 rounded-full border-2 border-dashed border-[#0D5C75]/25" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
