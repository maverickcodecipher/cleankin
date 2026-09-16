'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, CalendarCheck, Users, Megaphone, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import type { SpotStatusFilter } from '../components/CleanKinMap';
import ReportSpotModal from '../components/ReportSpotModal';
import CleanupDriveCard, { type CleanupDrive } from '../components/CleanupDriveCard';
import CreateDriveModal from '../components/CreateDriveModal';
import ImpactGallery from '../components/ImpactGallery';
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
    <div className="bg-white px-6 py-5 rounded-3xl border border-teal-100 shadow-sm flex items-center gap-4 min-w-[200px] w-full max-w-sm mx-auto box-sizing: border-box">
      <div className="bg-[#0D5C75]/10 p-3 rounded-2xl">
        <Icon className="w-7 h-7 text-[#0D5C75]" />
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900">
          {count}
          {suffix}
        </p>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
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

  const handleSpotReported = () => {
    setMapRefreshKey(k => k + 1);
    showToast('Spot reported! Your pin is now live on the Chennai Civic Map.');
  };

  return (
    <div className="flex flex-col gap-16 py-16 w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block bg-[#0D5C75]/10 text-[#0D5C75] text-xs md:text-sm font-black uppercase tracking-widest px-5 py-2.5 rounded-full mb-6">
          Chennai Civic Action Network
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.05]">
          CleanKin Chennai — Turn Dump Spots into Community Action
        </h1>
        <p className="text-xl text-slate-700 max-w-2xl mx-auto mb-10 leading-relaxed">
          Spot polluted drains, riverbanks, or illegal dumps. Report spots publicly, mobilize weekend drives, and track civic cleanup progress across Chennai.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 rounded-full text-white font-semibold hover:brightness-110 text-lg h-14 flex items-center shadow-md transition-all"
            style={{ backgroundColor: '#0D5C75' }}
          >
            <Megaphone className="w-5 h-5 mr-2" />
            Report a Dump Spot
          </button>
          <button
            type="button"
            onClick={() => setIsOrganizeOpen(true)}
            className="px-8 py-4 rounded-full border-2 font-semibold text-lg h-14 flex items-center transition-all hover:bg-teal-50"
            style={{ borderColor: '#0D5C75', color: '#0D5C75' }}
          >
            <CalendarDays className="w-5 h-5 mr-2" />
            Organize a Drive
          </button>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-teal-50/60 border border-teal-100 rounded-[2rem] p-8 md:p-10 flex flex-wrap justify-center gap-5">
          {STATS.map(s => (
            <StatBadge key={s.label} icon={s.icon} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      {/* Live Map */}
      <section id="map" className="w-full max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-5">Live Chennai Civic Hotspots</h2>
          <div className="flex flex-wrap justify-center items-center gap-2.5">
            {MAP_FILTERS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => setMapFilter(f.value)}
                aria-pressed={mapFilter === f.value}
                className={`px-5 py-2.5 rounded-full text-sm font-black transition-all duration-200 focus:outline-none ${
                  mapFilter === f.value
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
                }`}
                style={mapFilter === f.value ? { backgroundColor: '#0D5C75' } : undefined}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-sm font-black text-white shadow-md hover:brightness-110 transition-all duration-200 focus:outline-none"
              style={{ backgroundColor: '#0D5C75' }}
            >
              + Report a Spot
            </button>
          </div>
        </div>
        <div className="rounded-[2rem] overflow-hidden border border-teal-100 shadow-md h-[500px]">
          <CleanKinMap
            statusFilter={mapFilter}
            refreshKey={mapRefreshKey}
            onSpotDeleted={() => {
              setMapRefreshKey(k => k + 1);
              showToast('Spot removed from map.');
            }}
            onDriveCancelled={() => {
              setMapRefreshKey(k => k + 1);
              setDrivesRefreshKey(k => k + 1);
              showToast('Linked drive cancelled. Pin reset to Open.');
            }}
          />
        </div>
      </section>

      {/* Active Cleanup Drives */}
      <section id="drives" className="w-full max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-center md:text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Active Cleanup Drives</h2>
            <p className="text-lg text-slate-600 mt-2">Pick a weekend drive and show up — we handle the rest.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOrganizeOpen(true)}
            className="shrink-0 px-6 py-3.5 rounded-full border-2 font-black text-sm hover:bg-teal-50 transition-all"
            style={{ borderColor: '#0D5C75', color: '#0D5C75' }}
          >
            + Organize a Drive
          </button>
        </div>
        {isLoadingDrives ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[0, 1].map(i => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 animate-pulse">
                <div className="h-6 bg-slate-100 rounded-xl w-2/3" />
                <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
                <div className="h-2.5 bg-slate-100 rounded-full w-full" />
                <div className="h-12 bg-slate-100 rounded-full w-full" />
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
          <div className="text-center bg-white rounded-3xl border-2 border-dashed border-teal-200 px-8 py-14">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-[#0D5C75]" />
            <p className="text-xl font-extrabold text-slate-800">
              No active cleanup drives right now. Organize one below to mobilize local volunteers!
            </p>
            <button
              type="button"
              onClick={() => setIsOrganizeOpen(true)}
              className="mt-6 px-8 py-3.5 rounded-full text-white font-black text-sm hover:brightness-110 transition-all"
              style={{ backgroundColor: '#0D5C75' }}
            >
              + Organize a Drive
            </button>
          </div>
        )}
      </section>

      {/* Impact Showcase */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: '#0D5C75' }}>Community Impact</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3">Before & After: Chennai Transformed</h2>
          <p className="text-lg text-slate-600 mt-3 max-w-2xl mx-auto">Drag the handle on each card to compare. Real spots, real volunteers, real change.</p>
        </div>
        <ImpactGallery cleanedCount={cleanedCount} drivesCount={drives.length} volunteerCount={volunteerCount} />
      </section>

      {/* How it works */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">How CleanKin Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Report a spot', desc: 'Snap a photo of a dump, clogged drain, or littered riverbank and pin it on the Chennai map.' },
            { step: '02', title: 'Mobilize a drive', desc: 'Spots with enough reports trigger a weekend cleanup drive with volunteers and supplies.' },
            { step: '03', title: 'Track progress', desc: 'Before/after photos and ward-level stats keep every cleanup public and accountable.' },
          ].map(item => (
            <div key={item.step} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-black text-[#0D5C75] tracking-widest mb-3">{item.step}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/cleankin#map" className="text-lg font-bold underline" style={{ color: '#0D5C75' }}>
            View the Chennai cleanup map
          </Link>
        </div>
      </section>

      <ReportSpotModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSpotReported={handleSpotReported}
      />

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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-slate-900 text-white text-sm font-bold px-6 py-4 rounded-2xl shadow-2xl max-w-md text-center"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
