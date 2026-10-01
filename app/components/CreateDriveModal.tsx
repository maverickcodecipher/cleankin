'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const TIME_SLOTS = [
  { label: '06:00 AM - 09:00 AM', value: '06:00' },
  { label: '06:30 AM - 09:30 AM', value: '06:30' },
  { label: '07:00 AM - 10:00 AM', value: '07:00' },
];

const ORG_EXAMPLES = ['Youth For Coast', 'Rotaract Club', 'Civic Volunteers'];

type ReportedSpot = { id: string | number; title: string; locality: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onDriveCreated?: () => void;
};

export default function CreateDriveModal({ open, onClose, onDriveCreated }: Props) {
  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [spotId, setSpotId] = useState('');
  const [locality, setLocality] = useState('');
  const [spots, setSpots] = useState<ReportedSpot[]>([]);
  const [eventDate, setEventDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1].value);
  const [targetVolunteers, setTargetVolunteers] = useState('25');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const fetchSpots = async () => {
      try {
        const { data, error } = await supabase
          .from('dump_reports')
          .select('id, title, locality')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data) {
          setSpots(
            (data as any[]).map((r, i) => ({
              id: r.id ?? `spot-${i}`,
              title: String(r.title ?? 'Untitled spot'),
              locality: String(r.locality ?? 'Chennai'),
            }))
          );
        }
      } catch (err) {
        console.error('dump_reports fetch failed:', err);
      }
    };
    fetchSpots();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !organizerName.trim() || !eventDate) {
      setError('Please fill in the drive title, organizer name, and event date.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.from('cleanup_drives').insert([
        {
          title: title.trim(),
          organizer_name: organizerName.trim(),
          organizer_contact: organizerContact.trim() || '',
          locality: spotId
            ? spots.find(s => String(s.id) === spotId)?.locality || locality.trim()
            : locality.trim(),
          event_date: eventDate,
          event_time: timeSlot,
          target_volunteers: Number(targetVolunteers) || 25,
          current_volunteers: 0,
          status: 'Active',
        },
      ]);
      if (error) {
        console.error('cleanup_drives insert failed:', error);
        setError('Could not save your drive. Please try again.');
        return;
      }
      if (spotId) {
        const { error: spotError } = await supabase
          .from('dump_reports')
          .update({ status: 'Drive Scheduled' })
          .eq('id', spotId);
        if (spotError) console.error('dump_reports status update failed:', spotError);
      }
      setTitle('');
      setOrganizerName('');
      setOrganizerContact('');
      setSpotId('');
      setLocality('');
      setEventDate('');
      setTimeSlot(TIME_SLOTS[1].value);
      setTargetVolunteers('25');
      onClose();
      onDriveCreated?.();
    } catch (err) {
      console.error('cleanup_drives insert failed:', err);
      setError('Could not save your drive. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 perspective-1200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Organize a cleanup drive"
    >
      <div
        className="animate-ck-modal-in bg-[#0B100D] border border-[#35F27C]/25 rounded-[2rem] max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-[0_0_50px_rgba(53,242,124,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-extrabold text-white">Organize a Drive</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-[#93A89A]" />
          </button>
        </div>
        <p className="text-sm font-bold text-[#93A89A] mb-6">
          For NGOs and clubs — e.g. {ORG_EXAMPLES.join(', ')}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-black text-white mb-1.5" htmlFor="create-drive-title">Drive Title</label>
            <input
              id="create-drive-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Weekend Plastic Cleanup Drive"
              required
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-white mb-1.5" htmlFor="create-drive-org">Organization / Club Name</label>
            <input
              id="create-drive-org"
              type="text"
              value={organizerName}
              onChange={e => setOrganizerName(e.target.value)}
              placeholder="Youth For Coast"
              required
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-white mb-1.5" htmlFor="create-drive-contact">Organizer Contact / WhatsApp Number</label>
            <input
              id="create-drive-contact"
              type="tel"
              value={organizerContact}
              onChange={e => setOrganizerContact(e.target.value)}
              placeholder="e.g. 98410 12345"
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-white mb-1.5" htmlFor="create-drive-spot">Associated Spot / Locality</label>
            <select
              id="create-drive-spot"
              value={spotId}
              onChange={e => setSpotId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08] mb-3"
            >
              <option value="">Pick a reported spot…</option>
              {spots.map(s => (
                <option key={s.id} value={String(s.id)}>{s.title} · {s.locality}</option>
              ))}
            </select>
            <input
              type="text"
              value={locality}
              onChange={e => setLocality(e.target.value)}
              placeholder="Or type a free-text locality"
              aria-label="Free text locality"
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-black text-white mb-1.5" htmlFor="create-drive-date">Event Date</label>
              <input
                id="create-drive-date"
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-white mb-1.5" htmlFor="create-drive-slot">Morning Time Slot</label>
              <select
                id="create-drive-slot"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
              >
                {TIME_SLOTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-white mb-1.5" htmlFor="create-drive-target">Target Volunteers Needed</label>
            <input
              id="create-drive-target"
              type="number"
              min={1}
              value={targetVolunteers}
              onChange={e => setTargetVolunteers(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-[#FF8FA3] bg-[#FF5470]/10 border border-[#FF5470]/40 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-[#35F27C] text-[#04120A] font-black hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(53,242,124,0.35)]"
            style={{ backgroundColor: '#35F27C' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing drive...
              </>
            ) : (
              'Publish Drive'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
