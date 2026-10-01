'use client';

import { useState } from 'react';
import Leaderboard from './Leaderboard';
import ReportDumpModal from './ReportDumpModal';
import MyReportsModal from './MyReportsModal';
import OrganizeDriveModal from './OrganizeDriveModal';
import EventsSection from './EventsSection';
import type { WardLeaderboardEntry, Ward } from '@/types/database';

interface HomeClientProps {
  initialLeaderboard: WardLeaderboardEntry[];
  initialWards: Ward[];
  isDemo?: boolean;
}

export default function HomeClient({ initialLeaderboard, initialWards, isDemo = false }: HomeClientProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMyReports, setShowMyReports] = useState(false);
  const [showOrganizeModal, setShowOrganizeModal] = useState(false);

  const handleReportSubmitted = () => {
    setShowReportModal(false);
  };

  const handleEventCreated = () => {
    setShowOrganizeModal(false);
  };

  const handleEventsChange = () => {
    return;
  };

  const handleScrollToEvents = () => {
    setTimeout(() => {
      const section = document.getElementById('events-section');
      section?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex flex-col w-full bg-[#060A08]">
      <section className="relative w-full overflow-hidden bg-[#080D0A] border-b border-[#1D2B23]">
        <div className="ck-arena-grid absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#35F27C]/12 blur-[110px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-[#35F27C]/10 border border-[#35F27C]/30 text-[#35F27C] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              Season 01 · Civic audit arena
            </span>
            <h1 className="ck-text-3d text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.02]">
              CleanKin Chennai —<br />
              <span className="bg-gradient-to-r from-[#35F27C] to-[#A3E635] bg-clip-text text-transparent">Track Every Dump.</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#93A89A] mb-10 leading-relaxed">
              See which zones lead the Clean League. Report dumps, drain rival XP, and crown Chennai's cleanest area boss.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#35F27C] text-[#04120A] font-black text-lg hover:brightness-110 transition-all shadow-[0_0_30px_rgba(53,242,124,0.35)]"
              >
                Report a Dump
              </button>
              <button
                type="button"
                onClick={() => setShowOrganizeModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-[#35F27C]/50 text-[#35F27C] font-black text-lg hover:bg-[#35F27C]/10 transition-all"
              >
                Organize a Drive
              </button>
              <button
                type="button"
                onClick={handleScrollToEvents}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-[#2A3B32] text-white font-black text-lg hover:border-[#A3E635] hover:text-[#A3E635] transition-all"
              >
                Explore Drives
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" id="leaderboard-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2 text-center">
          <a href="/cleankin#map" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#35F27C] hover:brightness-110">
            Prefer the night radar? Play on the live map →
          </a>
        </div>
        <Leaderboard initialData={initialLeaderboard} isDemo={isDemo} />
      </section>

      <section className="pb-24" id="events-section">
        <EventsSection onEventChange={handleEventsChange} />
      </section>

      <ReportDumpModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        wards={initialWards}
        onReportSubmitted={handleReportSubmitted}
      />

      {showMyReports && (
        <MyReportsModal open={showMyReports} onClose={() => setShowMyReports(false)} />
      )}

      <OrganizeDriveModal
        open={showOrganizeModal}
        onClose={() => setShowOrganizeModal(false)}
        onEventCreated={handleEventCreated}
        initialWards={initialWards}
      />
    </div>
  );
}
