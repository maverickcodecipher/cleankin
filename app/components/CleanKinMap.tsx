'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
    html: `<svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1C8.8 1 3 6.8 3 14c0 9.75 13 27 13 27s13-17.25 13-27C29 6.8 23.2 1 16 1z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="14" r="5.5" fill="#fff"/>
    </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  });
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
        className="text-red-600 hover:text-red-700 text-xs font-semibold mt-2 underline cursor-pointer"
      >
        🗑 {isDeleting ? 'Deleting...' : 'Delete Spot'}
      </button>
      {deleteError && (
        <p className="text-xs font-bold text-red-600 mt-1">{deleteError}</p>
      )}
      {scheduled && (
        <button
          type="button"
          onClick={handleCancelDrive}
          disabled={isCancelling}
          className="block text-slate-500 hover:text-amber-700 text-xs font-semibold mt-1 underline cursor-pointer"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel linked drive'}
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

export default function CleanKinMap({ statusFilter = 'all', refreshKey = 0, onSpotDeleted, onDriveCancelled }: { statusFilter?: SpotStatusFilter; refreshKey?: number; onSpotDeleted?: (spotId: string | number) => void; onDriveCancelled?: (spotId: string | number) => void }) {
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
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[500px] rounded-[2rem] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
      </MapContainer>
    </div>
  );
}
