'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, CalendarCheck, Users, CalendarDays, MousePointerClick, Trash2, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import type { SpotStatusFilter } from '../components/CleanKinMap';
import ReportSpotModal from '../components/ReportSpotModal';
import CleanupDriveCard, { type CleanupDrive } from '../components/CleanupDriveCard';
import CreateDriveModal from '../components/CreateDriveModal';
import ImpactGallery from '../components/ImpactGallery';
import Hero3D from '../components/Hero3D';
import MyReportsModal from '../components/MyReportsModal';
import { supabase } from '../../lib/supabaseClient';
import { CLEANKIN_REPORT_EVENT } from '../components/CleanKinNavbar';

const CleanKinMap = dynamic(() => import('../components/CleanKinMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center">
      <p className="font-bold text-slate-400">Loading Chennai hotspots...</p>
    </div>
  ),
});

const MAP_FILTERS: { value: SpotStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Spots' },
  { value: 'open', label: 'Open' },
  { value: 'scheduled', label: 'Scheduled Drives' },
];

const STATS = [
  { icon: MapPin, value: 128, suffix: '', label: 'Reported Spots' },
  { icon: CalendarCheck, value: 24, suffix: '', label: 'Drives Completed' },
  { icon: Users, value: 350, suffix: '+', label: 'Active Volunteers' },
];

function StatBadge({ icon: Icon, value, suffix, label }: { icon: any; value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(value);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="perspective-1200 flex-1 min-w-[200px]">
      <div
        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          setTilt({ rx: -py * 14, ry: px * 14 });
        }}
        onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
        className="ck-card-3d bg-[#0B100D] backdrop-blur px-6 py-5 rounded-3xl border border-[#1D2B23] shadow-[0_18px_50px_rgba(0,0,0,0.6)] flex items-center gap-4"
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)` }}
      >
        <div className="bg-gradient-to-br from-[#35F27C] to-[#15803D] p-3 rounded-2xl shadow-[0_0_20px_rgba(53,242,124,0.4)]" style={{ transform: 'translateZ(30px)' }}>
          <Icon className="w-7 h-7 text-[#04120A]" />
        </div>
        <div style={{ transform: 'translateZ(18px)' }}>
          <p className="text-3xl font-black text-white">
            {count}
            {suffix}
          </p>
          <p className="text-xs font-black uppercase tracking-widest text-[#93A89A]">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function CleanKinPage() {
  const [mapFilter, setMapFilter] = useState<SpotStatusFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [toast, setToast] = useState('');
  const [drives, setDrives] = useState<CleanupDrive[]>([]);
  const [isLoadingDrives, setIsLoadingDrives] = useState(true);
  const [isOrganizeOpen, setIsOrganizeOpen] = useState(false);
  const [drivesRefreshKey, setDrivesRefreshKey] = useState(0);
  const [cleanedCount, setCleanedCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [picking, setPicking] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [showMyReports, setShowMyReports] = useState(false);
  const [focusPin, setFocusPin] = useState<{ lat: number; lng: number; nonce: number } | null>(null);

  // Open the report modal when triggered from the navbar (same tab or after navigation).
  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLEANKIN_REPORT_EVENT) === '1') {
        sessionStorage.removeItem(CLEANKIN_REPORT_EVENT);
        setIsModalOpen(true);
      }
    } catch {}
    const handler = () => setIsModalOpen(true);
    window.addEventListener(CLEANKIN_REPORT_EVENT, handler);
    return () => window.removeEventListener(CLEANKIN_REPORT_EVENT, handler);
  }, []);

  useEffect(() => {
    const fetchDrives = async () => {
      setIsLoadingDrives(true);
      try {
        const { data, error } = await supabase
          .from('cleanup_drives')
          .select('*')
          .order('event_date', { ascending: true });
        if (!error && data && data.length > 0) {
          setDrives(
            (data as any[]).map((r, i) => ({
              id: r.id ?? `db-${i}`,
              title: String(r.title ?? 'Untitled drive'),
              organizer_name: String(r.organizer_name ?? 'Community Organizer'),
              organizer_contact: r.organizer_contact ? String(r.organizer_contact) : null,
              event_date: String(r.event_date ?? ''),
              event_time: r.event_time ? String(r.event_time) : '07:00',
              target_volunteers: Number(r.target_volunteers) || 20,
              current_volunteers: Number(r.current_volunteers) || 0,
              status: r.status ? String(r.status) : 'Recruiting',
            }))
          );
        } else {
          if (error) console.error('cleanup_drives fetch failed:', error);
          setDrives([]);
        }
      } catch (err) {
        console.error('cleanup_drives fetch failed:', err);
        setDrives([]);
      } finally {
        setIsLoadingDrives(false);
      }
    };
    fetchDrives();
  }, [drivesRefreshKey]);

  useEffect(() => {
    const fetchImpactCounts = async () => {
      try {
        const [{ count: cleaned }, { count: volunteers }] = await Promise.all([
          supabase.from('dump_reports').select('*', { count: 'exact', head: true }).eq('status', 'Cleaned'),
          supabase.from('drive_volunteers').select('*', { count: 'exact', head: true }),
        ]);
        setCleanedCount(cleaned ?? 0);
        setVolunteerCount(volunteers ?? 0);
      } catch (err) {
        console.error('impact counts fetch failed:', err);
      }
    };
    fetchImpactCounts();
  }, [drivesRefreshKey, mapRefreshKey]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 5000);
  };

  const handleSpotReported = async () => {
    setMapRefreshKey(k => k + 1);
    setPicking(false);
    setPendingPin(null);
    setMapFilter('all');
    // Instant pin: fetch the freshest report and fly the night map to it.
    try {
      const { data } = await supabase
        .from('dump_reports')
        .select('id, latitude, longitude')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const row = data as { latitude?: number; longitude?: number } | null;
      if (row && Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude))) {
        setFocusPin({ lat: Number(row.latitude), lng: Number(row.longitude), nonce: Date.now() });
        setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }), 150);
        showToast('Dump pinned! Flying you to your live pin on the night map.');
        return;
      }
    } catch (err) {
      console.error('latest pin fetch failed:', err);
    }
    showToast('Spot reported! Your pin is now live on the night map.');
  };

  const handleMapPick = (lat: number, lng: number) => {
    setPendingPin({ lat, lng });
    setPicking(false);
    setIsModalOpen(true);
    showToast(`Pin dropped at ${lat.toFixed(4)}, ${lng.toFixed(4)} — complete the form to publish.`);
    document.getElementById('report-form-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const startPickMode = () => {
    setPicking(true);
    showToast('Pin mode ON — click anywhere on the map below to place your dump pin.');
    setTimeout(() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="flex flex-col gap-12 py-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* 3D Hero */}
      <Hero3D
        onReport={() => setIsModalOpen(true)}
        onOrganize={() => setIsOrganizeOpen(true)}
        onPickOnMap={startPickMode}
        picking={picking}
      />
      <div id="report-form-anchor" className="sr-only" />

      {/* Quick Stats Bar — 3D tilt */}
      <section className="w-full max-w-7xl mx-auto px-1 sm:px-2">
        <div className="relative bg-[#0B100D] border border-[#1D2B23] rounded-[2rem] p-6 md:p-8 flex flex-wrap justify-center gap-5 overflow-hidden">
          <div className="ck-arena-grid pointer-events-none absolute inset-0 opacity-40" />
          {STATS.map(s => (
            <StatBadge key={s.label} icon={s.icon} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => setShowMyReports(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B100D] border border-[#1D2B23] text-sm font-black text-white hover:border-[#35F27C] hover:text-[#35F27C] transition-all">
            <FolderOpen className="h-4 w-4" /> My Reports — delete / mark cleared
          </button>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B100D] border border-[#1D2B23] text-sm font-bold text-[#93A89A]">
            <Trash2 className="h-4 w-4 text-[#FF5470]" /> Every spot & drive has Delete / Cancel
          </span>
        </div>
      </section>

      {/* Live Map — night ops frame + click-to-pin */}
      <section id="map" className="w-full max-w-7xl mx-auto px-1 sm:px-2 scroll-mt-24">
        <div className="text-center mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#35F27C] mb-2">Night ops · live pins</p>
          <h2 className="ck-text-3d text-3xl md:text-5xl font-black tracking-tight text-white mb-3">CHENNAI DUMP RADAR</h2>
          <p className="text-[#93A89A] font-medium mb-5">Hit <b className="text-white">Pin on map</b>, click the radar to drop a glowing pin. Report it → we fly you straight to your live pin. Open any pin to Delete it or Cancel its linked drive.</p>
          <div className="flex flex-wrap justify-center items-center gap-2.5">
            {MAP_FILTERS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setMapFilter(f.value)}
                aria-pressed={mapFilter === f.value}
                className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 focus:outline-none ${
                  mapFilter === f.value
                    ? 'bg-[#35F27C] text-[#04120A] shadow-[0_0_20px_rgba(53,242,124,0.5)] scale-105'
                    : 'bg-[#0B100D] text-[#93A89A] border border-[#1D2B23] hover:border-[#35F27C]/60 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={startPickMode}
              className={`px-5 py-2.5 rounded-full text-sm font-black shadow-md transition-all focus:outline-none flex items-center gap-1.5 ${picking ? 'bg-[#FF5470] text-white animate-pulse' : 'bg-[#35F27C] text-[#04120A] hover:brightness-110'}`}
            >
              <MousePointerClick className="h-4 w-4" />
              {picking ? 'Click map now…' : '+ Pin on map'}
            </button>
            {picking && (
              <button type="button" onClick={() => setPicking(false)} className="px-5 py-2.5 rounded-full text-sm font-black bg-[#0B100D] border border-[#1D2B23] text-[#93A89A] hover:text-white">
                Cancel pin mode
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-sm font-black bg-transparent border-2 border-[#35F27C]/60 text-[#35F27C] hover:bg-[#35F27C]/10 transition-all"
            >
              + Report a Spot
            </button>
          </div>
          {pendingPin && (
            <p className="mt-3 inline-block text-sm font-bold text-[#35F27C] bg-[#35F27C]/10 border border-[#35F27C]/40 rounded-full px-4 py-2">
              Pending pin: {pendingPin.lat.toFixed(5)}, {pendingPin.lng.toFixed(5)} — finish the form to publish · <button type="button" onClick={() => setPendingPin(null)} className="underline font-black">clear</button>
            </p>
          )}
        </div>
        <div className="perspective-1200">
          <div className="ck-map-frame rounded-[2rem] overflow-hidden border border-[#35F27C]/25 bg-[#060A08] h-[560px] relative" style={{ transform: 'rotateX(2deg)' }}>
            <CleanKinMap
              statusFilter={mapFilter}
              refreshKey={mapRefreshKey}
              picking={picking}
              pendingPin={pendingPin}
              onPick={handleMapPick}
              focusPin={focusPin}
              onSpotDeleted={() => {
                setMapRefreshKey(k => k + 1);
                showToast('Spot deleted and removed from radar.');
              }}
              onDriveCancelled={() => {
                setMapRefreshKey(k => k + 1);
                setDrivesRefreshKey(k => k + 1);
                showToast('Linked drive cancelled. Pin reset to Open.');
              }}
            />
          </div>
        </div>
      </section>

      {/* Active Cleanup Drives */}
      <section id="drives" className="w-full max-w-7xl mx-auto px-1 sm:px-2 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 text-center md:text-left">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#35F27C] mb-2">Squad up · weekend raids</p>
            <h2 className="ck-text-3d text-3xl md:text-5xl font-black tracking-tight text-white">ACTIVE CLEANUP RAIDS</h2>
            <p className="text-lg text-[#93A89A] mt-2">Join a raid — or cancel / delete any drive you own. Every card has Delete.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOrganizeOpen(true)}
            className="shrink-0 px-6 py-3.5 rounded-2xl border-2 border-[#35F27C]/60 font-black text-sm text-[#35F27C] hover:bg-[#35F27C]/10 transition-all"
          >
            + Organize a Drive
          </button>
        </div>
        {isLoadingDrives ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[0, 1].map(i => (
              <div key={i} className="bg-[#0B100D] p-8 rounded-3xl border border-[#1D2B23] space-y-4 animate-pulse">
                <div className="h-6 bg-[#1D2B23] rounded-xl w-2/3" />
                <div className="h-4 bg-[#1D2B23] rounded-xl w-1/2" />
                <div className="h-2.5 bg-[#1D2B23] rounded-full w-full" />
                <div className="h-12 bg-[#1D2B23] rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : drives.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {drives.map(drive => (
              <CleanupDriveCard
                key={drive.id}
                drive={drive}
                onRsvpSuccess={() => {
                  setDrivesRefreshKey(k => k + 1);
                  showToast("You're registered! The organizers will WhatsApp you the meeting point details.");
                }}
                onDriveDeleted={(id) => {
                  setDrives(prev => prev.filter(d => d.id !== id));
                  showToast('Cleanup drive successfully canceled.');
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center bg-[#0B100D] rounded-3xl border-2 border-dashed border-[#35F27C]/30 px-8 py-14">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-[#35F27C]" />
            <p className="text-xl font-extrabold text-white">
              No active raids right now. Start one and rally your zone!
            </p>
            <button
              type="button"
              onClick={() => setIsOrganizeOpen(true)}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-[#35F27C] text-[#04120A] font-black text-sm hover:brightness-110 transition-all"
            >
              + Organize a Drive
            </button>
          </div>
        )}
      </section>

      {/* Impact Showcase */}
      <section className="w-full max-w-7xl mx-auto px-1 sm:px-2">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#35F27C]">Trophy cabinet</span>
          <h2 className="ck-text-3d text-3xl md:text-5xl font-black tracking-tight text-white mt-3">BEFORE & AFTER: CHENNAI TRANSFORMED</h2>
          <p className="text-lg text-[#93A89A] mt-3 max-w-2xl mx-auto">Drag the handle on each card to compare. Real spots, real squads, real change.</p>
        </div>
        <ImpactGallery cleanedCount={cleanedCount} drivesCount={drives.length} volunteerCount={volunteerCount} />
      </section>

      {/* How it works */}
      <section className="w-full max-w-7xl mx-auto px-1 sm:px-2">
        <h2 className="ck-text-3d text-3xl font-black tracking-tight text-center text-white mb-8">HOW THE ARENA WORKS</h2>
        <div className="grid md:grid-cols-3 gap-6 perspective-1200">
          {[
            { step: '01', title: 'Pin a dump at night', desc: 'Hit Pin on map, click the radar to drop a glowing pin, add photo + locality. Instant fly-to your live pin.' },
            { step: '02', title: 'Move the leaderboard', desc: 'Every report is XP for your zone — watch its TVK area boss climb or crash the Clean League.' },
            { step: '03', title: 'Raid & delete', desc: 'Join weekend raids. Delete spots, cancel drives, clear reports — full control, zero clutter.' },
          ].map(item => (
            <div key={item.step} className="ck-card-3d bg-[#0B100D] p-8 rounded-3xl border border-[#1D2B23] hover:border-[#35F27C]/50 hover:-translate-y-1.5 hover:shadow-[0_0_35px_rgba(53,242,124,0.15)] transition-all">
              <p className="text-sm font-black text-[#35F27C] tracking-widest mb-3">{item.step}</p>
              <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
              <p className="text-[#93A89A]">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/cleankin#map" className="text-lg font-black underline text-[#35F27C]">
            View the Chennai night radar
          </Link>
        </div>
      </section>

      <ReportSpotModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); }}
        onSpotReported={handleSpotReported}
        initialLat={pendingPin?.lat ?? null}
        initialLng={pendingPin?.lng ?? null}
      />

      {showMyReports && (
        <MyReportsModal open={showMyReports} onClose={() => setShowMyReports(false)} />
      )}

      <CreateDriveModal
        open={isOrganizeOpen}
        onClose={() => setIsOrganizeOpen(false)}
        onDriveCreated={() => {
          setDrivesRefreshKey(k => k + 1);
          showToast('Drive published! Volunteers can now join your cleanup.');
        }}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-[#0B100D] border border-[#35F27C]/50 text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(53,242,124,0.3)] max-w-md text-center"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
