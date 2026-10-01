'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export type SpotStatusFilter = 'all' | 'open' | 'scheduled';

type DumpSpot = {
  id: string | number;
  title: string;
  locality: string;
  latitude: number;
  longitude: number;
  status: string;
  image_url?: string | null;
};

const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];
const DEFAULT_ZOOM = 12;

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('clean')) return '#16A34A';
  if (s.includes('schedul') || s.includes('drive')) return '#D97706';
  return '#DC2626';
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('clean')) return 'bg-green-100 text-green-800 border-green-200';
  if (s.includes('schedul') || s.includes('drive')) return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

/** Custom SVG pin — also sidesteps the broken Next.js default-icon asset paths. */
function pinIcon(status: string): L.DivIcon {
  const color = statusColor(status);
  return L.divIcon({
    className: 'cleankin-pin',
    html: `<div class="animate-ck-pin"><svg width="34" height="44" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 10px 14px rgba(0,0,0,0.35))">
      <ellipse cx="16" cy="39" rx="8" ry="3" fill="rgba(0,0,0,0.22)"/>
      <path d="M16 1C8.8 1 3 6.8 3 14c0 9.75 13 27 13 27s13-17.25 13-27C29 6.8 23.2 1 16 1z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="14" r="5.5" fill="#fff"/>
      <circle cx="16" cy="14" r="2.4" fill="${color}"/>
    </svg></div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40],
  });
}

function pendingPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'cleankin-pin-pending',
    html: `<div class="animate-ck-pin"><svg width="38" height="48" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 12px 18px rgba(13,92,117,0.6))">
      <ellipse cx="16" cy="39" rx="9" ry="3.2" fill="rgba(13,92,117,0.25)"/>
      <path d="M16 1C8.8 1 3 6.8 3 14c0 9.75 13 27 13 27s13-17.25 13-27C29 6.8 23.2 1 16 1z" fill="#0D5C75" stroke="#fff" stroke-width="2.5"/>
      <circle cx="16" cy="14" r="6" fill="#fff"/>
      <text x="16" y="18.5" text-anchor="middle" font-size="11" font-weight="900" fill="#0D5C75">+</text>
    </svg></div>`,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
    popupAnchor: [0, -44],
  });
}

function MapClickHandler({ picking, onPick }: { picking: boolean; onPick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (picking && onPick) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Belt-and-braces: point Leaflet's default icon at CDN assets in case any
// default marker is ever rendered.
if (typeof window !== 'undefined') {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function matchesFilter(status: string, filter: SpotStatusFilter): boolean {
  if (filter === 'all') return true;
  const s = status.toLowerCase();
  if (filter === 'open') return s.includes('open');
  return s.includes('schedul') || s.includes('drive');
}

function isScheduledStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes('schedul') || s.includes('drive');
}

function SpotPopupContent({
  spot,
  setSpots,
  onSpotDeleted,
  onDriveCancelled,
}: {
  spot: DumpSpot;
  setSpots: Dispatch<SetStateAction<DumpSpot[]>>;
  onSpotDeleted?: (spotId: string | number) => void;
  onDriveCancelled?: (spotId: string | number) => void;
}) {
  const [deleteError, setDeleteError] = useState('');
  const [driveNote, setDriveNote] = useState('');
  const [driveError, setDriveError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const scheduled = isScheduledStatus(spot.status);

  const handleDelete = async () => {
    setDeleteError('');
    if (!window.confirm('Are you sure you want to remove this dump spot from the map?')) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('dump_reports').delete().eq('id', spot.id);
      if (error) {
        console.error('dump_reports delete failed:', error);
        setDeleteError('Could not delete this spot. Please try again.');
        return;
      }
      setSpots(prev => prev.filter(s => s.id !== spot.id));
      onSpotDeleted?.(spot.id);
    } catch (err) {
      console.error('dump_reports delete failed:', err);
      setDeleteError('Could not delete this spot. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDrive = async () => {
    setDriveNote('');
    setDriveError('');
    if (!window.confirm(`Cancel the linked cleanup drive for ${spot.locality}? The pin will return to Open.`)) return;
    setIsCancelling(true);
    try {
      const { data, error: fetchError } = await supabase.from('cleanup_drives').select('id, locality');
      if (fetchError) {
        console.error('cleanup_drives fetch for cancel failed:', fetchError);
        setDriveError('Could not cancel linked drive. Please try again.');
        return;
      }
      const target = String(spot.locality ?? '').trim().toLowerCase();
      const matched = ((data as any[]) ?? []).filter(
        r => String(r.locality ?? '').trim().toLowerCase() === target
      );
      if (matched.length === 0) {
        setDriveNote('No linked drive found for this locality.');
        return;
      }
      const ids = matched.map(r => r.id);
      const { error: delError } = await supabase.from('cleanup_drives').delete().in('id', ids);
      if (delError) {
        console.error('cleanup_drives delete for cancel failed:', delError);
        setDriveError('Could not cancel linked drive. Please try again.');
        return;
      }
      const { error: spotError } = await supabase.from('dump_reports').update({ status: 'Open' }).eq('id', spot.id);
      if (spotError) {
        console.error('dump_reports status reset failed:', spotError);
        setDriveError('Drive cancelled, but could not reset pin status. Please refresh.');
      }
      setSpots(prev => prev.map(s => (s.id === spot.id ? { ...s, status: 'Open' } : s)));
      onDriveCancelled?.(spot.id);
      if (!spotError) setDriveNote('Linked drive cancelled. Pin reset to Open.');
    } catch (err) {
      console.error('cancel linked drive failed:', err);
      setDriveError('Could not cancel linked drive. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-w-[200px] max-w-[240px]">
      {spot.image_url && (
        <img src={spot.image_url} alt={spot.title} className="w-full h-28 object-cover rounded-xl mb-2" />
      )}
      <p className="font-extrabold text-slate-900 text-sm leading-snug">{spot.title}</p>
      <p className="text-xs font-bold text-slate-500 mb-2">{spot.locality}</p>
      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border mb-3 ${statusBadgeClass(spot.status)}`}>
        {spot.status}
      </span>
      <Link
        href="/cleankin#drives"
        className="block text-center px-4 py-2 rounded-full text-white text-xs font-black hover:brightness-110 transition-all"
        style={{ backgroundColor: '#0D5C75' }}
      >
        Join Cleanup / View Details
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-full mt-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
      >
        🗑 {isDeleting ? 'Deleting spot...' : 'Delete Spot'}
      </button>
      {deleteError && (
        <p className="text-xs font-bold text-red-600 mt-1">{deleteError}</p>
      )}
      {scheduled && (
        <button
          type="button"
          onClick={handleCancelDrive}
          disabled={isCancelling}
          className="w-full mt-2 px-4 py-2.5 rounded-full border-2 border-amber-300 text-amber-800 text-xs font-black hover:bg-amber-50 transition-all cursor-pointer"
        >
          {isCancelling ? 'Cancelling drive...' : 'Cancel linked drive'}
        </button>
      )}
      {driveError && (
        <p className="text-xs font-bold text-red-600 mt-1">{driveError}</p>
      )}
      {driveNote && (
        <p className="text-xs font-bold text-slate-500 mt-1">{driveNote}</p>
      )}
    </div>
  );
}

export default function CleanKinMap({ statusFilter = 'all', refreshKey = 0, onSpotDeleted, onDriveCancelled, picking = false, pendingPin = null, onPick }: { statusFilter?: SpotStatusFilter; refreshKey?: number; onSpotDeleted?: (spotId: string | number) => void; onDriveCancelled?: (spotId: string | number) => void; picking?: boolean; pendingPin?: { lat: number; lng: number } | null; onPick?: (lat: number, lng: number) => void }) {
  const [spots, setSpots] = useState<DumpSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { data, error } = await supabase
          .from('dump_reports')
          .select('id, title, locality, latitude, longitude, status, image_url');
        if (!error && data && data.length > 0) {
          const rows = (data as any[])
            .filter(r => Number.isFinite(Number(r.latitude)) && Number.isFinite(Number(r.longitude)))
            .map((r, i) => ({
              id: r.id ?? `db-${i}`,
              title: String(r.title ?? 'Untitled spot'),
              locality: String(r.locality ?? 'Chennai'),
              latitude: Number(r.latitude),
              longitude: Number(r.longitude),
              status: String(r.status ?? 'Open'),
              image_url: r.image_url ?? null,
            }));
          setSpots(rows);
        } else {
          if (error) console.error('dump_reports fetch failed:', error);
          setSpots([]);
        }
      } catch (err) {
        console.error('dump_reports fetch failed:', err);
        setSpots([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpots();
  }, [refreshKey]);

  const visibleSpots = spots.filter(s => matchesFilter(s.status, statusFilter));

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {isLoading && (
        <div className="absolute inset-0 z-[500] bg-slate-100 animate-pulse flex items-center justify-center rounded-[2rem]">
          <p className="font-bold text-slate-400">Loading Chennai hotspots...</p>
        </div>
      )}
      {picking && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] pointer-events-none">
          <div className="ck-glass border border-[#0D5C75]/30 shadow-xl rounded-full px-5 py-2.5 text-sm font-black text-[#0D5C75] flex items-center gap-2 animate-ck-float">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0D5C75] animate-ping" />
            Click anywhere on the map to drop your dump pin
          </div>
        </div>
      )}
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px] rounded-[2rem] z-0"
        style={{ cursor: picking ? 'crosshair' : undefined }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler picking={picking} onPick={onPick} />
        {visibleSpots.map(spot => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={pinIcon(spot.status)}
          >
            <Popup>
              <SpotPopupContent
                spot={spot}
                setSpots={setSpots}
                onSpotDeleted={onSpotDeleted}
                onDriveCancelled={onDriveCancelled}
              />
            </Popup>
          </Marker>
        ))}
        {pendingPin && Number.isFinite(pendingPin.lat) && Number.isFinite(pendingPin.lng) && (
          <Marker position={[pendingPin.lat, pendingPin.lng]} icon={pendingPinIcon()}>
            <Popup>
              <div className="min-w-[200px] text-center">
                <p className="font-extrabold text-slate-900 text-sm">New dump pin</p>
                <p className="text-xs font-bold text-slate-500 mb-3">{pendingPin.lat.toFixed(5)}, {pendingPin.lng.toFixed(5)}</p>
                <p className="text-xs font-semibold text-[#0D5C75]">Complete the report form to publish this pin.</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
