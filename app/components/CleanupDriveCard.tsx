'use client';

import { useState } from 'react';
import { CalendarDays, Clock, Users, MessageCircle, X, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export type CleanupDrive = {
  id: string | number;
  title: string;
  organizer_name: string;
  organizer_contact?: string | null;
  event_date: string;
  event_time?: string | null;
  target_volunteers: number;
  current_volunteers: number;
  status?: string | null;
};

function driveDateTime(drive: CleanupDrive): Date {
  return new Date(`${drive.event_date}T${drive.event_time || '07:00:00'}`);
}

export function formatDriveDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  } catch {}
  return dateStr;
}

function waLink(contact: string | null | undefined): string | null {
  if (!contact) return null;
  const digits = contact.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

function RsvpModal({
  drive,
  onClose,
  onSuccess,
}: {
  drive: CleanupDrive;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please enter your full name and WhatsApp number.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('drive_volunteers').insert([
        { drive_id: drive.id, volunteer_name: name.trim(), volunteer_phone: phone.trim() },
      ]);
      if (insertError) {
        console.error('drive_volunteers insert failed:', insertError);
        setError('Could not save your RSVP. Please try again.');
        return;
      }
      const { error: updateError } = await supabase
        .from('cleanup_drives')
        .update({ current_volunteers: Number(drive.current_volunteers || 0) + 1 })
        .eq('id', drive.id);
      if (updateError) {
        console.error('cleanup_drives count increment failed:', updateError);
      }
      setDone(true);
      onSuccess();
    } catch (err) {
      console.error('RSVP failed:', err);
      setError('Could not save your RSVP. Please try again.');
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
      aria-label={`Join ${drive.title}`}
    >
      <div
        className="animate-ck-modal-in bg-[#0B100D] border border-[#35F27C]/25 rounded-[2rem] max-w-md w-full p-8 shadow-[0_0_50px_rgba(53,242,124,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-extrabold text-white mb-3">You&apos;re registered!</h3>
            <p className="text-[#93A89A] font-medium mb-6">
              The organizers will WhatsApp you the meeting point details.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-2xl bg-[#35F27C] text-[#04120A] font-black hover:brightness-110 transition-all"
              style={{ backgroundColor: '#35F27C' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-extrabold text-white">Join This Drive</h3>
              <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-[#93A89A]" />
              </button>
            </div>
            <p className="text-sm font-bold text-[#93A89A] mb-6">{drive.title}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-white mb-1.5" htmlFor="rsvp-name">Full Name</label>
                <input
                  id="rsvp-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-[#35F27C] focus:outline-none font-bold text-white text-sm bg-[#060A08]"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-1.5" htmlFor="rsvp-phone">WhatsApp / Phone Number</label>
                <input
                  id="rsvp-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 98410 12345"
                  required
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
                    Registering...
                  </>
                ) : (
                  'Confirm RSVP'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteDriveModal({
  drive,
  onClose,
  onDeleted,
}: {
  drive: CleanupDrive;
  onClose: () => void;
  onDeleted: (id: string | number) => void;
}) {
  const [phone, setPhone] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const storedDigits = (drive.organizer_contact || '').replace(/\D/g, '');
  const requiresPhone = storedDigits.length > 0;

  const handleDelete = async () => {
    if (requiresPhone && phone.replace(/\D/g, '') !== storedDigits) {
      setError('That number does not match the organizer contact on file.');
      return;
    }
    setIsDeleting(true);
    setError('');
    try {
      if (!String(drive.id).startsWith('starter-')) {
        const { error } = await supabase
          .from('cleanup_drives')
          .delete()
          .eq('id', drive.id);
        if (error) {
          console.error('cleanup_drives delete failed:', error);
          setError('Could not cancel this drive. Please try again.');
          return;
        }
      }
      onClose();
      onDeleted(drive.id);
    } catch (err) {
      console.error('cleanup_drives delete failed:', err);
      setError('Could not cancel this drive. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Cancel ${drive.title}`}
    >
      <div
        className="animate-ck-modal-in bg-[#0B100D] border border-[#35F27C]/25 rounded-[2rem] max-w-md w-full p-8 shadow-[0_0_50px_rgba(53,242,124,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-[#FF5470]/10 flex items-center justify-center mb-4">
          <Trash2 className="w-7 h-7 text-red-600" />
        </div>
        <h3 className="text-xl font-extrabold text-white mb-2">Cancel this cleanup drive?</h3>
        <p className="text-sm font-medium text-[#93A89A] mb-1">
          Are you sure you want to cancel this cleanup drive? This action cannot be undone.
        </p>
        <p className="text-sm font-black text-white mb-5">{drive.title}</p>

        {requiresPhone && (
          <div className="mb-4">
            <label className="block text-sm font-black text-white mb-1.5" htmlFor={`cancel-phone-${drive.id}`}>
              Confirm with organizer contact number
            </label>
            <input
              id={`cancel-phone-${drive.id}`}
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter organizer phone number"
              className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] focus:border-red-400 focus:outline-none font-bold text-white text-sm bg-[#060A08]"
            />
          </div>
        )}

        {error && (
          <p className="text-sm font-bold text-[#FF8FA3] bg-[#FF5470]/10 border border-[#FF5470]/40 rounded-xl px-4 py-3 mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3.5 rounded-2xl border-2 border-[#1D2B23] text-[#93A89A] font-black text-sm hover:bg-white/5 transition-all disabled:opacity-60"
          >
            Keep Drive
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-3.5 rounded-2xl bg-[#FF5470] text-[#1A0509] font-black text-sm hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Yes, Cancel Drive'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CleanupDriveCard({
  drive,
  onRsvpSuccess,
  onDriveDeleted,
}: {
  drive: CleanupDrive;
  onRsvpSuccess?: () => void;
  onDriveDeleted?: (id: string | number) => void;
}) {
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const eventDateTime = new Date(`${drive.event_date}T${drive.event_time || '07:00:00'}`);
  const hoursRemaining = (eventDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const isLocked = hoursRemaining <= 24 || drive.status === 'Locked';

  const target = Number(drive.target_volunteers) || 1;
  const current = Number(drive.current_volunteers) || 0;
  const progress = Math.min(Math.round((current / target) * 100), 100);
  const wa = waLink(drive.organizer_contact);

  const hour = eventDateTime.getHours();
  const slot = Number.isFinite(hour) && hour < 12 ? 'Morning Slot' : 'Slot';

  return (
    <div className="perspective-1200">
    <div
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ rx: -py * 8, ry: px * 10 });
      }}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      className="ck-card-3d bg-[#0B100D] p-8 rounded-3xl border border-[#1D2B23] shadow-[0_18px_50px_rgba(0,0,0,0.6)] flex flex-col hover:border-[#35F27C]/40 hover:shadow-[0_0_35px_rgba(53,242,124,0.12)] transition-all"
      style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-xl font-extrabold text-white leading-snug">{drive.title}</h3>
        {isLocked ? (
          <span className="shrink-0 bg-white/5 border border-[#1D2B23] text-[#93A89A] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            Registration Closed (Supplies Finalized)
          </span>
        ) : (
          <span className="shrink-0 bg-[#35F27C]/15 text-[#35F27C] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#35F27C]/40">
            Recruiting Volunteers
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-[#93A89A] mb-1">
        <span>By {drive.organizer_name}</span>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat with ${drive.organizer_name} on WhatsApp`}
            className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-[#93A89A] mb-5">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-[#35F27C]" />
          {formatDriveDate(drive.event_date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#35F27C]" />
          {drive.event_time ? drive.event_time.slice(0, 5) : '07:00'} · {slot}
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between text-sm font-black">
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <Users className="w-4 h-4 text-[#35F27C]" />
          {current} / {target} Volunteers Enrolled
        </span>
        <span className="text-[#35F27C]">{progress}%</span>
      </div>
      <div className="h-2.5 bg-white/5 border border-[#1D2B23] rounded-full overflow-hidden mb-6" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="ck-xp-fill h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {isLocked ? (
        <button
          type="button"
          disabled
          className="mt-auto w-full py-3.5 rounded-2xl bg-white/5 border border-[#1D2B23] text-[#5C7263] font-black text-sm cursor-not-allowed"
        >
          Registration Locked (Event Tomorrow)
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsRsvpOpen(true)}
          className="mt-auto w-full py-3.5 rounded-2xl bg-[#35F27C] text-[#04120A] font-black text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(53,242,124,0.35)]"
          style={{ backgroundColor: '#35F27C' }}
        >
          Join This Drive
        </button>
      )}

      {isRsvpOpen && (
        <RsvpModal
          drive={drive}
          onClose={() => setIsRsvpOpen(false)}
          onSuccess={() => onRsvpSuccess?.()}
        />
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          aria-label={`Cancel ${drive.title}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#FF5470]/40 text-xs font-black text-[#FF8FA3] hover:bg-[#FF5470]/10 hover:border-[#FF5470]/70 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Cancel Drive
        </button>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          aria-label={`Delete ${drive.title}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-[#1D2B23] text-xs font-black text-[#93A89A] hover:text-[#FF8FA3] hover:border-[#FF5470]/50 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Drive
        </button>
      </div>

      {isDeleteOpen && (
        <DeleteDriveModal
          drive={drive}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={(id) => onDriveDeleted?.(id)}
        />
      )}
    </div>
    </div>
  );
}
