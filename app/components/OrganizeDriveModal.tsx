'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import type { Ward } from '@/types/database';

interface OrganizeDriveModalProps {
  open: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  initialWards: Ward[];
}

export default function OrganizeDriveModal({ open, onClose, onEventCreated, initialWards }: OrganizeDriveModalProps) {
  const { isAuthenticated, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [wards] = useState<Ward[]>(initialWards);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('07:00');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [selectedWardId, setSelectedWardId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      handleSignIn();
      return;
    }

    if (!title.trim() || !eventDate || selectedWardId === 0) {
      setError('Please fill in the title, date, and select a ward.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          event_date: eventDate,
          event_time: eventTime,
          meeting_point: meetingPoint.trim() || null,
          ward_id: selectedWardId,
        }),
      });

      if (res.ok) {
        onEventCreated();
        setTitle('');
        setDescription('');
        setEventDate('');
        setEventTime('07:00');
        setMeetingPoint('');
        setSelectedWardId(0);
        onClose();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to create event.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Organize a Drive"
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Organize a Cleanup Drive</h2>
            <p className="text-sm font-semibold text-slate-500">Mobilize volunteers for a weekend cleanup.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Close">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="bg-civic-orange/5 border border-civic-orange/20 rounded-2xl p-6 text-center mb-4">
            <p className="text-slate-700 font-semibold mb-4">You need to sign in to organize drives.</p>
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-civic-orange text-white font-bold hover:brightness-110 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="drive-title" className="block text-sm font-bold text-slate-700 mb-1.5">Drive Title</label>
              <input
                id="drive-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend Plastic Cleanup Drive"
                required
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-civic-orange focus:outline-none font-semibold text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="drive-ward" className="block text-sm font-bold text-slate-700 mb-1.5">Select Ward</label>
              <select
                id="drive-ward"
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold focus:border-civic-orange focus:outline-none"
              >
                <option value={0}>Choose a ward...</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>Ward {w.ward_number} — {w.zone_name} · {w.locality_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="drive-date" className="block text-sm font-bold text-slate-700 mb-1.5">Event Date</label>
                <input
                  id="drive-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-civic-orange focus:outline-none font-semibold text-slate-800 text-sm"
                />
              </div>
              <div>
                <label htmlFor="drive-time" className="block text-sm font-bold text-slate-700 mb-1.5">Time Slot</label>
                <select
                  id="drive-time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-semibold focus:border-civic-orange focus:outline-none"
                >
                  <option value="06:00">06:00 AM</option>
                  <option value="06:30">06:30 AM</option>
                  <option value="07:00">07:00 AM</option>
                  <option value="07:30">07:30 AM</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="drive-meeting" className="block text-sm font-bold text-slate-700 mb-1.5">Meeting Point</label>
              <input
                id="drive-meeting"
                type="text"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="e.g. Near the ward office"
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-civic-orange focus:outline-none font-semibold text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="drive-desc" className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
              <textarea
                id="drive-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the cleanup drive..."
                rows={3}
                className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-civic-orange focus:outline-none font-semibold text-slate-800 text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-full bg-civic-orange text-white font-extrabold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none">
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </circle>
                  </svg>
                  Publishing...
                </span>
              ) : (
                'Publish Drive'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
