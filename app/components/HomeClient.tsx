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
}

export default function HomeClient({ initialLeaderboard, initialWards }: HomeClientProps) {
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
    <div className="flex flex-col w-full">
      <section className="relative w-full overflow-hidden bg-slate-50">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle, #F97316 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="max-w-2xl">
            <span className="inline-block bg-civic-orange/10 text-civic-orange text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              Civic Audit Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.05]">
              CleanKin Chennai —<br />
              <span className="text-civic-orange">Track Every Dump.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed">
              See which wards lead in civic cleanup. Report dump spots, monitor ward-level progress, and help keep Chennai spotless.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-civic-orange text-white font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-civic-orange/20"
              >
                Report a Dump
              </button>
              <button
                type="button"
                onClick={() => setShowOrganizeModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-civic-orange text-civic-orange font-bold text-lg hover:bg-civic-orange/5 transition-all"
              >
                Organize a Drive
              </button>
              <button
                type="button"
                onClick={handleScrollToEvents}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-slate-300 text-slate-700 font-bold text-lg hover:border-civic-orange hover:text-civic-orange hover:bg-civic-orange/5 transition-all"
              >
                Explore Drives
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24" id="leaderboard-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Ward Leaderboard</h2>
              <p className="text-lg text-slate-600 mt-2">Real-time civic cleanliness rankings across Chennai</p>
            </div>
          </div>
          <Leaderboard initialData={initialLeaderboard} />
        </div>
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
