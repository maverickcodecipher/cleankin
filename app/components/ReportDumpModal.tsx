'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createSupabaseClient } from '@/utils/supabase/client';
import type { Ward } from '@/types/database';

interface ReportDumpModalProps {
  open: boolean;
  onClose: () => void;
  wards: Ward[];
  onReportSubmitted: () => void;
}

export default function ReportDumpModal({ open, onClose, wards, onReportSubmitted }: ReportDumpModalProps) {
  const { user, isAuthenticated, signInWithGoogle } = useAuth();
  const [selectedWardId, setSelectedWardId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploadUrl, setPhotoUploadUrl] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'acquired' | 'error'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleGetGPS = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsStatus('detecting');
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGpsStatus('acquired');
      },
      () => {
        setGpsStatus('error');
        setError('Could not get location. Please enable location permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    setUploading(true);
    setError('');
    try {
      const supabase = createSupabaseClient();
      if (!user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop();
      const filePath = `uploads/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('dump-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: urlData } = await supabase.storage
        .from('dump-images')
        .getPublicUrl(filePath);

      setPhotoUploadUrl(urlData.publicUrl);
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated || !user) {
      handleSignIn();
      return;
    }

    if (selectedWardId === 0) {
      setError('Please select a ward.');
      return;
    }

    if (!gpsCoords) {
      setError('Please acquire your GPS location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dump-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_id: selectedWardId,
          latitude: gpsCoords.latitude,
          longitude: gpsCoords.longitude,
          image_url: photoUploadUrl,
          description: description || null,
        }),
      });

      if (res.ok) {
        onReportSubmitted();
        setSelectedWardId(0);
        setDescription('');
        setPhotoPreview(null);
        setPhotoUploadUrl(null);
        setGpsCoords(null);
        setGpsStatus('idle');
        onClose();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to submit report.');
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
      aria-label="Report a dump spot"
    >
      <div
        className="animate-ck-modal-in bg-[#0B100D] border border-[#35F27C]/25 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(53,242,124,0.15)] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Report a Dump Spot</h2>
            <p className="text-sm font-semibold text-[#93A89A]">Pin it on the night radar. +25 XP for your zone.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close">
            <svg className="w-6 h-6 text-[#93A89A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="bg-[#35F27C]/5 border border-[#35F27C]/25 rounded-2xl p-6 text-center mb-4">
            <p className="text-[#C7D6CC] font-semibold mb-4">You need to sign in to report dump spots.</p>
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#35F27C] text-[#04120A] font-black hover:brightness-110 transition-all"
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
              <label className="block text-sm font-bold text-white mb-2">Location</label>
              <button
                type="button"
                onClick={handleGetGPS}
                disabled={gpsStatus === 'detecting'}
                className={`w-full h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 focus:outline-none ${
                  gpsStatus === 'acquired'
                    ? 'border-[#35F27C]/60 bg-[#35F27C]/10 text-[#35F27C]'
                    : gpsStatus === 'detecting'
                    ? 'border-[#1D2B23] bg-white/5 text-[#5C7263] cursor-wait'
                    : 'border-[#1D2B23] bg-[#060A08] text-white hover:border-[#35F27C]/60 hover:bg-[#35F27C]/5'
                }`}
              >
                {gpsStatus === 'detecting' && '📍 Detecting location...'}
                {gpsStatus === 'acquired' && `📍 GPS Acquired (${gpsCoords?.latitude.toFixed(4)}, ${gpsCoords?.longitude.toFixed(4)})`}
                {gpsStatus === 'idle' && '📍 Get My Location'}
                {gpsStatus === 'error' && '📍 Location unavailable'}
              </button>
              {gpsStatus === 'error' && <p className="text-xs font-bold text-dump-rose mt-1">{error}</p>}
            </div>

            <div>
              <label htmlFor="ward-select" className="block text-sm font-bold text-white mb-1.5">Select Zone Battleground</label>
              <select
                id="ward-select"
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-xl border-2 border-[#1D2B23] bg-[#060A08] text-white font-semibold focus:border-[#35F27C] focus:outline-none"
              >
                <option value={0}>Choose a ward...</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    Ward {w.ward_number} — {w.zone_name} · {w.locality_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-1.5">Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-14 rounded-xl border-2 border-dashed border-[#2A3B32] hover:border-[#35F27C] text-sm font-bold text-[#93A89A] hover:text-[#35F27C] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none">
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </circle>
                    </svg>
                    Uploading...
                  </span>
                ) : photoPreview ? (
                  <span>Change Photo</span>
                ) : (
                  <span>📷 Take / Upload Photo</span>
                )}
              </button>
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-xl" />
              )}
              {photoUploadUrl && !photoPreview && (
                <p className="text-xs text-[#35F27C] mt-1 font-semibold">✓ Photo uploaded successfully</p>
              )}
            </div>

            <div>
              <label htmlFor="dump-desc" className="block text-sm font-bold text-white mb-1.5">Intel (description)</label>
              <textarea
                id="dump-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Overflowing garbage near bus depot"
                rows={3}
                className="w-full p-4 rounded-xl border-2 border-[#1D2B23] bg-[#060A08] focus:border-[#35F27C] focus:outline-none font-semibold text-white text-sm placeholder:text-[#5C7263]"
              />
            </div>

            {error && (
              <div className="p-3 bg-[#FF5470]/10 border border-[#FF5470]/40 rounded-xl text-[#FF8FA3] text-sm font-bold">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full h-14 rounded-2xl bg-[#35F27C] text-[#04120A] font-black hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(53,242,124,0.35)]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none">
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </circle>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Dump Report'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
