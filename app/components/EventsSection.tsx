'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/utils/supabase/client';
import type { CleanupEvent, Profile, CleanupEventStatus } from '@/types/database';

interface EventsSectionProps {
  onEventChange: () => void;
}

const REASON_OPTIONS = [
  'Cleared by Municipal Corporation (GCC)',
  'Cleared by Community / CleanKin Drive',
  'False Report / Inaccurate Location',
  'Duplicate Report',
];

export default function EventsSection({ onEventChange }: EventsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const [enrolledMap, setEnrolledMap] = useState<Record<number, Profile[]>>({});
  const [showCancelPrompt, setShowCancelPrompt] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events ?? []);
      }
    } catch {
      console.error('Failed to fetch events');
    }

    const enrollmentMap: Record<number, Profile[]> = {};
    for (const event of events) {
      try {
        const res = await fetch(`/api/events/${event.id}/enrollments`);
        if (res.ok) {
          const d = await res.json();
          enrollmentMap[event.id] = d.profiles ?? [];
        }
      } catch {
        // ignore
      }
    }
    setEnrolledMap(enrollmentMap);
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadEvents();
  }, [onEventChange]);
/* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleJoin = async (eventId: number) => {
    if (!isAuthenticated || !user) {
      const supabase = createSupabaseClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return;
    }

    const res = await fetch(`/api/events/${eventId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });

    if (res.ok) {
      onEventChange();
    }
  };

  const handleLeave = async (eventId: number) => {
    const res = await fetch(`/api/events/${eventId}/enroll`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });

    if (res.ok) {
      onEventChange();
    }
  };

  const handleCancelClick = (eventId: number) => {
    setShowCancelPrompt(eventId);
    setSelectedReason('');
    setError('');
  };

  const handleConfirmCancel = async () => {
    if (!selectedReason.trim() || !user) return;
    setIsCancelling(true);
    setError('');

    const status: CleanupEventStatus = selectedReason.includes('False') || selectedReason.includes('Duplicate')
      ? 'cancelled'
      : 'cancelled';

    const res = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: showCancelPrompt,
        status,
        cancellation_reason: selectedReason,
      }),
    });

    if (res.ok) {
      setShowCancelPrompt(null);
      setSelectedReason('');
      onEventChange();
      router.refresh();
    } else {
      setError('Failed to cancel event.');
    }
    setIsCancelling(false);
  };

  const getDateStr = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getTimeStr = (timeStr: string | null) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className="pb-24" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Upcoming Cleanup Drives</h2>
            <p className="text-lg text-[#93A89A] mt-2">Join a drive, make a difference in your ward</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
          <div className="p-3 bg-[#FF5470]/10 border border-[#FF5470]/40 rounded-xl text-[#FF8FA3] text-sm font-bold">{error}</div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#0B100D] border border-[#1D2B23] rounded-2xl p-12 text-center">
            <p className="text-lg font-black text-white mb-2">No upcoming raids</p>
            <p className="text-sm text-[#93A89A]">Be the first to organize a cleanup drive in your ward!</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const enrolled = enrolledMap[event.id] ?? [];
            const isOrganizer = user?.id === event.organizer_id;
            const isEnrolled = enrolled.some((p) => p.id === user?.id);

            return (
              <div key={event.id} className="bg-[#0B100D] border border-[#1D2B23] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {event.status === 'cancelled' && (
                  <div className="bg-dump-rose/10 border-b border-dump-rose/20 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-dump-rose text-xs font-black uppercase tracking-wider">Cancelled</span>
                    </div>
                    <p className="text-sm font-semibold text-dump-rose mt-1">{event.cancellation_reason}</p>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">{event.title}</h3>
                      <p className="text-sm text-[#93A89A] mt-0.5">{event.description ?? ''}</p>
                    </div>
                    {event.status === 'scheduled' && (
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-[#35F27C]/15 text-[#35F27C] border-[#35F27C]/40">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-[#93A89A] mb-4">
                    <span>📅 {getDateStr(event.event_date)}</span>
                    <span>🕐 {getTimeStr(event.event_time)}</span>
                    {event.meeting_point && <span>📍 {event.meeting_point}</span>}
                  </div>

                  {/* Organizer */}
                  {event.organizer_id && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#35F27C]/15 border border-[#35F27C]/40 flex items-center justify-center">
                        <span className="text-[#35F27C] text-xs font-black">
                          {event.organizer_id.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[#C7D6CC]">Organizer</span>
                    </div>
                  )}

                  {/* Ward */}
                  {event.ward_id && (
                    <div className="mb-4">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-[#1D2B23] text-[#C7D6CC] text-xs font-bold">
                        Ward {event.ward_id}
                      </span>
                    </div>
                  )}

                  {/* Enrolled Volunteers */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-[#93A89A]">{enrolled.length}</span>
                      <span className="text-sm text-[#93A89A]">volunteer{enrolled.length !== 1 ? 's' : ''}</span>
                    </div>
                    {enrolled.length > 0 && (
                      <div className="flex -space-x-2">
                        {enrolled.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="w-7 h-7 rounded-full border-2 border-[#060A08] bg-[#35F27C] flex items-center justify-center text-[#04120A] text-[10px] font-black"
                            title={p.full_name ?? 'Volunteer'}
                          >
                            {(p.full_name ?? '?').charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {enrolled.length > 3 && (
                          <div className="w-7 h-7 rounded-full border-2 border-[#060A08] bg-[#2A3B32] flex items-center justify-center text-white text-[10px] font-black">
                            +{enrolled.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {event.status === 'cancelled' ? (
                    <div className="w-full py-2.5 rounded-xl bg-white/5 border border-[#1D2B23] text-[#5C7263] font-bold text-sm text-center">
                      Drive Cancelled
                    </div>
                  ) : isEnrolled ? (
                    <button
                      type="button"
                      onClick={() => handleLeave(event.id)}
                      className="w-full py-3 rounded-xl border-2 border-[#1D2B23] text-[#93A89A] font-bold text-sm hover:border-dump-rose hover:text-dump-rose hover:bg-[#FF5470]/10 transition-all focus:outline-none"
                    >
                      Leave Drive
                    </button>
                  ) : isOrganizer ? (
                    <button
                      type="button"
                      onClick={() => handleCancelClick(event.id)}
                      className="w-full py-3 rounded-xl border-2 border-dump-rose/20 text-dump-rose font-bold text-sm hover:bg-[#FF5470]/10 hover:border-dump-rose transition-all focus:outline-none"
                    >
                      Cancel Drive
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoin(event.id)}
                      className="w-full py-3 rounded-2xl bg-[#35F27C] text-[#04120A] font-black text-sm hover:brightness-110 transition-all focus:outline-none shadow-[0_0_20px_rgba(53,242,124,0.35)]"
                    >
                      Join Drive
                    </button>
                  )}
                </div>

                {/* Cancel Prompt */}
                {showCancelPrompt === event.id && (
                  <div
                    className="fixed inset-0 z-[1001] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => { setShowCancelPrompt(null); setError(''); }}
                  >
                    <div
                      className="bg-[#0B100D] rounded-3xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(53,242,124,0.15)] border border-[#35F27C]/25"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-xl font-extrabold text-white mb-2">Cancel This Drive?</h3>
                      <p className="text-sm text-[#93A89A] mb-4">Select a reason. This action cannot be undone.</p>

                      <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                        {REASON_OPTIONS.map((reason) => (
                          <label
                            key={reason}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedReason === reason
                                ? 'border-[#35F27C] bg-[#35F27C]/10'
                                : 'border-[#1D2B23] hover:border-[#35F27C]/40'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`cancel-reason-${event.id}`}
                              value={reason}
                              checked={selectedReason === reason}
                              onChange={() => setSelectedReason(reason)}
                              className="accent-[#35F27C]"
                            />
                            <span className="text-sm font-semibold text-[#C7D6CC]">{reason}</span>
                          </label>
                        ))}
                      </div>

                      {error && <p className="text-sm font-bold text-[#FF8FA3] mb-3">{error}</p>}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setShowCancelPrompt(null); setError(''); }}
                          className="flex-1 py-3 rounded-2xl border-2 border-[#1D2B23] text-[#93A89A] font-bold text-sm hover:bg-white/5 transition-all"
                        >
                          Keep Drive
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmCancel}
                          disabled={isCancelling || !selectedReason}
                          className="flex-1 py-3 rounded-2xl bg-[#FF5470] text-[#1A0509] font-black text-sm hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-wait"
                        >
                          {isCancelling ? 'Cancelling...' : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
