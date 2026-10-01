'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MapPin, Camera, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CHENNAI_AREAS = [
  'Adyar', 'Velachery', 'Mylapore', 'Tambaram', 'Royapuram', 'Guindy',
  'Navalur', 'Anna Nagar', 'T. Nagar', 'Marina', 'Chintadripet',
  'Perungalathur', 'Sholinganallur', 'Medavakkam', 'Chromepet',
  'Perambur', 'Porur', 'Nungambakkam', 'Other',
];

const DEFAULT_LAT = 13.0827;
const DEFAULT_LNG = 80.2707;
const PLACEHOLDER_PHOTO =
  'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80';

type Props = {
  open: boolean;
  onClose: () => void;
  onSpotReported?: () => void;
  initialLat?: number | null;
  initialLng?: number | null;
};

export default function ReportSpotModal({ open, onClose, onSpotReported, initialLat, initialLng }: Props) {
  const [title, setTitle] = useState('');
  const [locality, setLocality] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(String(DEFAULT_LAT));
  const [lng, setLng] = useState(String(DEFAULT_LNG));
  const [gpsNote, setGpsNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync map-picked coords into the form whenever modal opens with a pin.
  useEffect(() => {
    if (open && initialLat != null && initialLng != null && Number.isFinite(initialLat) && Number.isFinite(initialLng)) {
      setLat(String(initialLat));
      setLng(String(initialLng));
      setGpsNote('Pinned from map — drag-free, edit if needed.');
    }
  }, [open, initialLat, initialLng]);

  if (!open) return null;

  const useGps = () => {
    setGpsNote('');
    if (!('geolocation' in navigator)) {
      setGpsNote(`GPS unavailable — defaulted to central Chennai (${DEFAULT_LAT}, ${DEFAULT_LNG}).`);
      setLat(String(DEFAULT_LAT));
      setLng(String(DEFAULT_LNG));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLng(String(pos.coords.longitude.toFixed(6)));
        setGpsNote('GPS location captured.');
      },
      () => {
        setLat(String(DEFAULT_LAT));
        setLng(String(DEFAULT_LNG));
        setGpsNote(`Permission denied — defaulted to central Chennai (${DEFAULT_LAT}, ${DEFAULT_LNG}).`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      // Keep base64 payloads small; otherwise fall back to placeholder URL.
      setPhotoDataUrl(dataUrl.length > 0 && dataUrl.length < 500_000 ? dataUrl : '');
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setTitle('');
    setLocality('');
    setDescription('');
    setLat(String(DEFAULT_LAT));
    setLng(String(DEFAULT_LNG));
    setGpsNote('');
    setPhotoPreview('');
    setPhotoDataUrl('');
    setReporterName('');
    setReporterPhone('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locality) {
      setError('Please add a spot title and locality.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.from('dump_reports').insert([
        {
          title: title.trim(),
          locality,
          description: description.trim(),
          latitude: Number(lat) || DEFAULT_LAT,
          longitude: Number(lng) || DEFAULT_LNG,
          image_url: photoDataUrl || PLACEHOLDER_PHOTO,
          reported_by: reporterName.trim() || 'Anonymous Citizen',
          reporter_phone: reporterPhone.trim() || '',
          status: 'Open',
        },
      ]);
      if (error) {
        console.error('dump_reports insert failed:', error);
        setError('Could not save your report. Please try again.');
        return;
      }
      reset();
      onClose();
      onSpotReported?.();
    } catch (err) {
      console.error('dump_reports insert failed:', err);
      setError('Could not save your report. Please try again.');
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
      aria-label="Report a dump spot"
    >
      <div
        className="animate-ck-modal-in preserve-3d bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-teal-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Report a Dump Spot</h2>
            <p className="text-sm font-bold text-slate-500">Your pin goes live on the Chennai Civic Map.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-black text-slate-800 mb-1.5" htmlFor="spot-title">Spot Title</label>
            <input
              id="spot-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Clogged drain near bus stand"
              required
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#0D5C75] focus:outline-none font-bold text-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-slate-800 mb-1.5" htmlFor="spot-locality">Locality / Neighborhood</label>
            <select
              id="spot-locality"
              value={locality}
              onChange={e => setLocality(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#0D5C75] focus:outline-none font-bold text-slate-800 text-sm bg-white"
            >
              <option value="" disabled>Select area…</option>
              {CHENNAI_AREAS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-800 mb-1.5" htmlFor="spot-desc">Description</label>
            <textarea
              id="spot-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Landmark details and waste types (plastic, debris, domestic waste)…"
              rows={3}
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-[#0D5C75] focus:outline-none font-bold text-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-slate-800 mb-1.5">Location coordinates</label>
            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <input
                type="number"
                step="any"
                value={lat}
                onChange={e => setLat(e.target.value)}
                aria-label="Latitude"
                className="h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#0D5C75] focus:outline-none font-bold text-slate-800 text-sm"
              />
              <input
                type="number"
                step="any"
                value={lng}
                onChange={e => setLng(e.target.value)}
                aria-label="Longitude"
                className="h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#0D5C75] focus:outline-none font-bold text-slate-800 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={useGps}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-[#0D5C75] text-[#0D5C75] text-sm font-black hover:bg-teal-50 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Use My Current GPS
            </button>
            {gpsNote && <p className="mt-2 text-xs font-bold text-slate-500">{gpsNote}</p>}
          </div>

          <div>
            <label className="block text-sm font-black text-slate-800 mb-1.5">Photo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={e => handlePhoto(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0D5C75] text-sm font-black text-slate-500 hover:text-[#0D5C75] transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {photoPreview ? 'Change photo' : 'Take photo / Upload image'}
            </button>
            {photoPreview && (
              <img src={photoPreview} alt="Spot preview" className="mt-3 w-full h-40 object-cover rounded-xl" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-black text-slate-800 mb-1.5" htmlFor="spot-name">Your name</label>
              <input
                id="spot-name"
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                placeholder="Optional"
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#0D5C75] focus:outline-none font-bold text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800 mb-1.5" htmlFor="spot-phone">Phone</label>
              <input
                id="spot-phone"
                type="tel"
                value={reporterPhone}
                onChange={e => setReporterPhone(e.target.value)}
                placeholder="Optional"
                className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 focus:border-[#0D5C75] focus:outline-none font-bold text-slate-800 text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-full text-white font-black hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            style={{ backgroundColor: '#0D5C75' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Reporting spot...
              </>
            ) : (
              'Submit Spot Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
